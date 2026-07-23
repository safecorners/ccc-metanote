import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";

describe("Button", () => {
  it("children을 렌더한다", () => {
    render(<Button>무료로 시작하기</Button>);
    expect(
      screen.getByRole("button", { name: "무료로 시작하기" }),
    ).toBeInTheDocument();
  });

  it("기본 variant는 primary다", () => {
    render(<Button>확인</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-primary");
  });

  it("variant별 클래스가 적용된다", () => {
    const { rerender } = render(<Button variant="secondary">데모 보기</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-surface", "shadow-l1");

    rerender(<Button variant="utility">로그아웃</Button>);
    expect(button).toHaveClass("bg-surface", "border-hairline", "rounded-md");
  });

  it("클릭 시 onClick이 호출된다", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>확인</Button>);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("disabled면 클릭이 차단되고 속성이 설정된다", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        확인
      </Button>,
    );
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("type 속성이 DOM까지 전달된다", () => {
    render(<Button type="submit">저장</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });
});
