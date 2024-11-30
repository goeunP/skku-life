import { render, screen, waitFor, act } from "@testing-library/react";
import PenaltyPage from "@/pages/PenaltyPage";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import "@testing-library/jest-dom";

vi.mock("@/utils/fetchWithToken", () => ({
  fetchWithToken: vi.fn(),
}));

import { fetchWithToken } from "@/utils/fetchWithToken";

describe("PenaltyPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("renders header and navigation", async () => {
    fetchWithToken.mockResolvedValueOnce({
      json: () => Promise.resolve({ penaltyLogs: [] })
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <PenaltyPage />
        </MemoryRouter>
      );
    });

    expect(screen.getByRole("tab", { name: /메인/i })).toBeInTheDocument();
  });

  test("renders date divider for messages", async () => {
    const mockData = {
      penaltyLogs: [
        {
          alaramDate: "2024-11-23T12:00:00.000Z",
          alarmMessage: "첫 번째 메시지",
          alarmType: "penalty",
        },
        {
          alaramDate: "2024-11-24T09:00:00.000Z",
          alarmMessage: "두 번째 메시지",
          alarmType: "penalty",
        },
      ],
    };

    fetchWithToken.mockResolvedValueOnce({
      json: () => Promise.resolve(mockData)
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <PenaltyPage />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText("첫 번째 메시지")).toBeInTheDocument();
    });

    expect(screen.getByText(/2024년 11월 23일/)).toBeInTheDocument();
    expect(screen.getByText(/2024년 11월 24일/)).toBeInTheDocument();
  });

  // test("handles empty message data gracefully", async () => {
  //   fetchWithToken.mockResolvedValueOnce({
  //     json: () => Promise.resolve({ penaltyLogs: [] })
  //   });

  //   await act(async () => {
  //     render(
  //       <MemoryRouter>
  //         <PenaltyPage />
  //       </MemoryRouter>
  //     );
  //   });

  //   await waitFor(() => {
  //     const noPenaltyMessage = screen.getByText("모두가 인증을 완료했습니다");
  //     expect(noPenaltyMessage).toBeInTheDocument();
      
  //     // 직접적인 스타일 확인으로 변경
  //     const messageContainer = noPenaltyMessage.closest('div[style*="background-color"]');
  //     expect(messageContainer).toHaveStyle({
  //       backgroundColor: 'rgb(200, 255, 195)',
  //     });
  //   });
  // });

  test("handles API call failure", async () => {
    fetchWithToken.mockRejectedValueOnce(new Error("Network Error"));

    await act(async () => {
      render(
        <MemoryRouter>
          <PenaltyPage />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "오류가 발생했습니다"
      );
    });
  });

  test("renders message with default style for unknown type", async () => {
    const mockData = {
      penaltyLogs: [
        {
          alaramDate: "2024-11-25T12:00:00.000Z",
          alarmMessage: "Unknown type message",
          alarmType: "unknown",
        },
      ],
    };

    fetchWithToken.mockResolvedValueOnce({
      json: () => Promise.resolve(mockData)
    });

    await act(async () => {
      render(
        <MemoryRouter>
          <PenaltyPage />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      const message = screen.getByText("Unknown type message");
      const messageContainer = message.closest('div[style*="background-color"]');
      expect(messageContainer).toHaveStyle({
        backgroundColor: 'rgb(240, 240, 240)',
      });
    });
  });
});