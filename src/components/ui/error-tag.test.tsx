import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorTag } from "./error-tag";

describe("ErrorTag", () => {
  it("라벨과 카테고리 색 점을 렌더한다", () => {
    render(<ErrorTag label="계산 실수" dotClassName="bg-accent-pink" />);
    const tag = screen.getByRole("button", { name: "계산 실수" });
    expect(tag).toBeInTheDocument();
    expect(tag.querySelector(".bg-accent-pink")).not.toBeNull();
  });

  it("기본 상태는 aria-pressed=false + 중립 배경이다", () => {
    render(<ErrorTag label="부주의" dotClassName="bg-accent-teal" />);
    const tag = screen.getByRole("button");
    expect(tag).toHaveAttribute("aria-pressed", "false");
    expect(tag).toHaveClass("bg-canvas-soft");
  });

  it("selected면 aria-pressed=true + selectedClassName이 적용된다", () => {
    render(
      <ErrorTag
        label="개념 이해 부족"
        dotClassName="bg-accent-orange"
        selected
        selectedClassName="bg-accent-orange/15 text-accent-orange-deep"
      />,
    );
    const tag = screen.getByRole("button");
    expect(tag).toHaveAttribute("aria-pressed", "true");
    expect(tag).toHaveClass("bg-accent-orange/15", "text-accent-orange-deep");
    expect(tag).not.toHaveClass("bg-canvas-soft");
  });

  it("클릭 시 onClick이 호출된다", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <ErrorTag
        label="문제 해석 오류"
        dotClassName="bg-accent-sky"
        onClick={onClick}
      />,
    );
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("type=button이라 폼을 제출하지 않는다", () => {
    render(<ErrorTag label="시간 부족" dotClassName="bg-accent-purple" />);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });
});
