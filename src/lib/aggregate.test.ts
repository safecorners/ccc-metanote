import { describe, expect, it } from "vitest";
import {
  computeGapEntries,
  computeStats,
  countByErrorType,
  gapComment,
  unitTypeMatrix,
  weeklyStreak,
  weeklyTrend,
} from "./aggregate";
import { ERROR_TYPE_IDS, type ErrorTypeId } from "./taxonomy";
import type { ScorePrediction } from "./types";

type MistakeLike = {
  error_type: ErrorTypeId;
  mistake_date: string;
  unit: { id: number; name: string; grade: number };
};

function mistake(
  error_type: ErrorTypeId,
  unit: { id: number; name: string; grade: number },
  mistake_date = "2026-07-24",
): MistakeLike {
  return { error_type, mistake_date, unit };
}

const 일차부등식 = { id: 12, name: "일차부등식", grade: 2 };
const 일차함수 = { id: 14, name: "일차함수와 그래프", grade: 2 };
const 소인수분해 = { id: 1, name: "소인수분해", grade: 1 };

describe("countByErrorType", () => {
  it("5개 유형을 taxonomy 순서 그대로, 없는 유형은 0으로 채워 돌려준다", () => {
    const result = countByErrorType([
      mistake("calc_error", 일차부등식),
      mistake("calc_error", 일차함수),
      mistake("misread", 소인수분해),
    ]);

    expect(result.map((r) => r.id)).toEqual(ERROR_TYPE_IDS);
    expect(result.find((r) => r.id === "calc_error")!.count).toBe(2);
    expect(result.find((r) => r.id === "misread")!.count).toBe(1);
    expect(result.find((r) => r.id === "no_concept")!.count).toBe(0);
    expect(result.find((r) => r.id === "time_pressure")!.count).toBe(0);
  });

  it("라벨과 차트 색을 함께 담는다", () => {
    const [first] = countByErrorType([]);
    expect(first).toMatchObject({
      id: "misread",
      label: "문제 해석 오류",
      color: "#62aef0",
      count: 0,
    });
  });
});

describe("unitTypeMatrix", () => {
  it("단원별로 유형 카운트를 모으고 총합 내림차순으로 정렬한다", () => {
    const result = unitTypeMatrix([
      mistake("calc_error", 일차부등식),
      mistake("careless", 일차부등식),
      mistake("calc_error", 일차부등식),
      mistake("misread", 소인수분해),
    ]);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      unitId: 12,
      unitName: "일차부등식",
      grade: 2,
      total: 3,
    });
    expect(result[0].counts.calc_error).toBe(2);
    expect(result[0].counts.careless).toBe(1);
    expect(result[0].counts.misread).toBe(0);
    expect(result[1]).toMatchObject({ unitId: 1, total: 1 });
  });

  it("총합이 같으면 학년·단원명 순으로 정렬해 순서가 안정적이다", () => {
    const result = unitTypeMatrix([
      mistake("careless", 일차함수),
      mistake("misread", 소인수분해),
    ]);

    expect(result.map((r) => r.unitId)).toEqual([1, 14]);
  });

  it("기록이 없으면 빈 배열", () => {
    expect(unitTypeMatrix([])).toEqual([]);
  });
});

describe("weeklyTrend", () => {
  it("오늘이 속한 주를 마지막으로 최근 N주 버킷을 만든다 (월요일 시작)", () => {
    // 2026-07-24는 금요일 → 그 주의 월요일은 7/20
    const result = weeklyTrend([], "2026-07-24", 4);

    expect(result.map((w) => w.weekStart)).toEqual([
      "2026-06-29",
      "2026-07-06",
      "2026-07-13",
      "2026-07-20",
    ]);
    expect(result.map((w) => w.label)).toEqual([
      "6/29",
      "7/6",
      "7/13",
      "7/20",
    ]);
  });

  it("일요일 기록은 그 주 월요일 버킷에 들어간다", () => {
    const result = weeklyTrend(
      [
        mistake("calc_error", 일차부등식, "2026-07-26"), // 일요일 → 7/20 주
        mistake("calc_error", 일차부등식, "2026-07-20"), // 월요일 → 7/20 주
        mistake("misread", 소인수분해, "2026-07-13"), // 그 전 주
      ],
      "2026-07-24",
      2,
    );

    expect(result).toHaveLength(2);
    expect(result[0].weekStart).toBe("2026-07-13");
    expect(result[0].counts.misread).toBe(1);
    expect(result[0].total).toBe(1);
    expect(result[1].weekStart).toBe("2026-07-20");
    expect(result[1].counts.calc_error).toBe(2);
    expect(result[1].total).toBe(2);
  });

  it("범위 밖(너무 오래된) 기록은 무시한다", () => {
    const result = weeklyTrend(
      [mistake("careless", 일차부등식, "2026-06-01")],
      "2026-07-24",
      2,
    );

    expect(result.every((w) => w.total === 0)).toBe(true);
  });
});

function prediction(
  overrides: Partial<ScorePrediction> & { id: string },
): ScorePrediction {
  return {
    user_id: "u",
    exam_name: "중간고사",
    predicted: null,
    actual: null,
    exam_date: "2026-07-01",
    created_at: "2026-07-01T00:00:00Z",
    ...overrides,
  };
}

describe("computeGapEntries", () => {
  it("예상·실제가 둘 다 있는 기록만 시험일 순으로 계산한다", () => {
    const result = computeGapEntries([
      prediction({ id: "b", predicted: 80, actual: 90, exam_date: "2026-07-10", exam_name: "기말" }),
      prediction({ id: "a", predicted: 85, actual: 73, exam_date: "2026-06-10", exam_name: "중간" }),
      prediction({ id: "c", predicted: 90, actual: null, exam_date: "2026-07-20" }),
    ]);

    expect(result.map((e) => e.id)).toEqual(["a", "b"]);
    expect(result[0]).toMatchObject({
      examName: "중간",
      predicted: 85,
      actual: 73,
      gap: -12,
    });
    expect(result[1].gap).toBe(10);
  });
});

// 2026-07-24(금) 기준: 이번 주 월요일 = 7/20, 지난주 = 7/13, 2주 전 = 7/6
describe("weeklyStreak", () => {
  const d = (date: string) => ({ mistake_date: date });

  it("기록이 없으면 0", () => {
    expect(weeklyStreak([], "2026-07-24")).toBe(0);
  });

  it("이번 주에만 기록이 있으면 1", () => {
    expect(weeklyStreak([d("2026-07-24")], "2026-07-24")).toBe(1);
  });

  it("이번 주 + 지난주 연속이면 2", () => {
    expect(
      weeklyStreak([d("2026-07-22"), d("2026-07-15")], "2026-07-24"),
    ).toBe(2);
  });

  it("이번 주 기록이 아직 없어도 지난주까지의 연속은 유지된다 (유예)", () => {
    expect(
      weeklyStreak([d("2026-07-13"), d("2026-07-06")], "2026-07-24"),
    ).toBe(2);
  });

  it("지난주도 이번 주도 비었으면 끊긴 것 — 0", () => {
    expect(weeklyStreak([d("2026-07-06")], "2026-07-24")).toBe(0);
  });

  it("중간에 빈 주가 있으면 거기서 멈춘다", () => {
    expect(
      weeklyStreak(
        [d("2026-07-24"), d("2026-07-15"), d("2026-07-01")], // 7/6 주는 비었음
        "2026-07-24",
      ),
    ).toBe(2);
  });

  it("한 주에 여러 건 기록해도 1주로 센다", () => {
    expect(
      weeklyStreak(
        [d("2026-07-20"), d("2026-07-22"), d("2026-07-24")],
        "2026-07-24",
      ),
    ).toBe(1);
  });
});

describe("computeStats", () => {
  it("누적 기록·극복 완료 수·주 스트릭을 함께 계산한다", () => {
    const stats = computeStats(
      [
        { mistake_date: "2026-07-24", resolved: true },
        { mistake_date: "2026-07-22", resolved: false },
        { mistake_date: "2026-07-15", resolved: true },
      ],
      "2026-07-24",
    );

    expect(stats).toEqual({ total: 3, resolvedCount: 2, streak: 2 });
  });

  it("빈 목록이면 전부 0", () => {
    expect(computeStats([], "2026-07-24")).toEqual({
      total: 0,
      resolvedCount: 0,
      streak: 0,
    });
  });
});

describe("gapComment", () => {
  it("과신(실제 < 예상)이면 격차를 짚어준다", () => {
    expect(gapComment(-12)).toBe(
      "예상보다 12점 낮았어요 — 아는 것과 안다고 느끼는 것의 차이예요",
    );
  });

  it("과소평가(실제 > 예상)면 방향을 반대로 해석한다", () => {
    expect(gapComment(10)).toBe(
      "예상보다 10점 높았어요 — 실력보다 스스로를 낮게 봤어요",
    );
  });

  it("일치하면 자기 평가가 정확하다고 말해준다", () => {
    expect(gapComment(0)).toBe("예상과 실제가 일치했어요 — 자기 평가가 정확해요");
  });
});
