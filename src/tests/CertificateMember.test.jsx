import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from 'vitest';
import { useNavigate } from "react-router-dom";
import CertificateMember from "@/components/certificate/CertificateMember";
import "@testing-library/jest-dom";

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

describe("CertificateMember", () => {
  const mockNavigate = vi.fn();
  const today = "2024-11-30";
  
  const defaultProps = {
    img: "src/assets/logo.png",
    userName: "Test User",
    totalCnt: 10,
    curCnt: 5,
    status: "none",
    id: "test-id",
    date: today,
    yesVote: 0,
    noVote: 0
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  test("renders member information correctly", () => {
    render(<CertificateMember {...defaultProps} />);
    
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText(/투표 현황/)).toBeInTheDocument();
    expect(screen.getByAltText("user")).toBeInTheDocument();
  });

  test("displays correct status message for fail status", () => {
    render(
      <CertificateMember
        {...defaultProps}
        status="fail"
      />
    );
    
    expect(screen.getByText("인증 실패")).toBeInTheDocument();
  });

  test("displays correct status message for success status", () => {
    render(
      <CertificateMember
        {...defaultProps}
        status="success"
      />
    );
    
    expect(screen.getByText("인증 성공")).toBeInTheDocument();
  });

  test("handles voting and updates count", () => {
    render(
      <CertificateMember
        {...defaultProps}
        userName="테스트 유저"
      />
    );

    // button 요소들을 모두 찾아서 그 중에서 찾기
    const buttons = screen.getAllByRole('button');
    const approveButton = buttons.find(button => 
      button.style.backgroundColor === 'lightgreen'
    );
    const rejectButton = buttons.find(button => 
      button.style.backgroundColor === 'pink'
    );
    
    // 승인 버튼이 존재하는지 확인
    expect(approveButton).toBeDefined();
    expect(rejectButton).toBeDefined();
    
    // 승인 투표
    if (approveButton) {
      fireEvent.click(approveButton);
      expect(screen.getByText(/투표 현황 6\/10/)).toBeInTheDocument();
      expect(screen.getByText("투표 완료")).toBeInTheDocument();
    }
  });

  test("shows appropriate message for self-voting", () => {
    render(
      <CertificateMember
        {...defaultProps}
        userName="최다일"
      />
    );
    
    expect(screen.getByText("본인 투표")).toBeInTheDocument();
  });

  test("shows vote buttons only for valid conditions", () => {
    render(
      <CertificateMember
        {...defaultProps}
        userName="테스트 유저"
        date={today}
        status="none"
      />
    );
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    
    const approveButton = buttons.find(button => 
      button.style.backgroundColor === 'lightgreen'
    );
    const rejectButton = buttons.find(button => 
      button.style.backgroundColor === 'pink'
    );
    
    expect(approveButton).toBeDefined();
    expect(rejectButton).toBeDefined();
  });
});