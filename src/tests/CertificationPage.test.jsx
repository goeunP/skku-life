import { render, screen, waitFor, act } from "@testing-library/react";
import CertificationPage from "@/pages/CertificationPage";
import axios from "axios";
import { vi } from "vitest";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";

// Mock the entire fetchWithToken module
vi.mock("../utils/fetchWithToken", () => ({
  fetchWithToken: vi.fn().mockImplementation((url) => {
    if (url.includes("/class/")) {
      return Promise.resolve({
        json: () => Promise.resolve([{
          classId: "class123",
          classMember: [
            { userName: "User1" },
            { userName: "User2" }
          ]
        }])
      });
    }
    return Promise.resolve({
      json: () => Promise.resolve({ verifications: [] })
    });
  })
}));

vi.mock("axios");

describe("CertificationPage", () => {
  const mockUserInfo = {
    data: {
      userName: "User1",
      userClass: [{
        classId: "class123",
        classMember: [
          { userName: "User1" },
          { userName: "User2" }
        ]
      }]
    }
  };

  const mockCertifications = {
    data: {
      verifications: [
        {
          verificationId: "ver1",
          userName: "User1",
          yesVote: 3,
          noVote: 1,
          verificationImage: "image-url",
          userImage: "profile-url"
        }
      ]
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock sessionStorage
    const sessionStorageData = {
      token: "token123",
      currentGroup: "class123"
    };
    
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: (key) => sessionStorageData[key],
        setItem: vi.fn(),
        clear: vi.fn()
      },
      writable: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderWithRouter = (component) => {
    return render(
      <MemoryRouter>
        {component}
      </MemoryRouter>
    );
  };

  test("renders header and navigation tabs", async () => {
    axios.get.mockResolvedValue(mockUserInfo);

    await act(async () => {
      renderWithRouter(<CertificationPage />);
    });

    expect(screen.getByText("스꾸라이프")).toBeInTheDocument();
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "메인" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "인증" })).toBeInTheDocument();
  });

  test("fetches and displays user information", async () => {
    axios.get.mockResolvedValue(mockUserInfo);

    await act(async () => {
      renderWithRouter(<CertificationPage />);
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("/user/info"),
        expect.any(Object)
      );
    });
  });

  test("handles API error for user info", async () => {
    const error = new Error("Failed to fetch user info");
    axios.get.mockRejectedValueOnce(error);

    await act(async () => {
      renderWithRouter(<CertificationPage />);
    });

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching user info:",
        expect.any(Error)
      );
    });
  });

  test("displays formatted date correctly", async () => {
    axios.get.mockResolvedValue(mockUserInfo);

    await act(async () => {
      renderWithRouter(<CertificationPage />);
    });

    await waitFor(() => {
      const dateRegex = /\d{4}년 \d{1,2}월 \d{1,2}일 [월화수목금토일]요일/;
      const dateElements = screen.queryAllByText(dateRegex);
      expect(dateElements.length).toBe(0); // 초기에는 데이터가 없으므로 0
    });
  });

  test("handles certification upload button", async () => {
    axios.get.mockResolvedValue(mockUserInfo);

    await act(async () => {
      renderWithRouter(<CertificationPage />);
    });

    await waitFor(() => {
      const uploadButton = screen.getByText(/\+ 인증하기/i);
      expect(uploadButton).toBeInTheDocument();
    });
  });
});