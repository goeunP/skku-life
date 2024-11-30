import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import CertificateBtn from "@/components/certificate/CertificateBtn";
import * as fetchUtils from "@/utils/fetchWithToken";
import { vi } from 'vitest';
import "@testing-library/jest-dom";

vi.mock("@/utils/fetchWithToken", () => ({
  fetchWithToken: vi.fn()
}));

describe("CertificateBtn", () => {
  let mockSessionStorage;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // sessionStorage 모킹
    mockSessionStorage = {
      getItem: vi.fn().mockReturnValue('test-class-id')
    };
    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("renders initial upload button", () => {
    render(<CertificateBtn />);
    const button = screen.getByRole('button');
    const heading = screen.getByText("+ 인증하기");
    expect(button).toContainElement(heading);
  });

  test("handles API error", async () => {
    mockSessionStorage.getItem.mockReturnValue(null);
    
    const { container } = render(<CertificateBtn />);
    const fileInput = container.querySelector('input[type="file"]');
    const file = new File(["test image"], "test.png", { type: "image/png" });
    
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("모임 ID를 찾을 수 없습니다!");
    });
  });

  test("handles empty file selection", () => {
    const { container } = render(<CertificateBtn />);
    const fileInput = container.querySelector('input[type="file"]');
    
    fireEvent.change(fileInput, { target: { files: [] } });
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  test("calls onUploadSuccess with correct image URL", async () => {
    const mockOnUploadSuccess = vi.fn();
    const mockImageUrl = "test-image-url.jpg";
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ 
        verifications: [{ verificationImage: mockImageUrl }] 
      })
    };
    fetchUtils.fetchWithToken.mockResolvedValueOnce(mockResponse);

    const { container } = render(<CertificateBtn onUploadSuccess={mockOnUploadSuccess} />);
    const fileInput = container.querySelector('input[type="file"]');
    const file = new File(["test image"], "test.png", { type: "image/png" });
    
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    await waitFor(() => {
      expect(mockOnUploadSuccess).toHaveBeenCalledWith(mockImageUrl);
    });
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  test("handles successful upload and shows success message", async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ 
        verifications: [{ verificationImage: 'test.jpg' }] 
      })
    };
    fetchUtils.fetchWithToken.mockResolvedValueOnce(mockResponse);

    const { container } = render(<CertificateBtn />);
    const fileInput = container.querySelector('input[type="file"]');
    const file = new File(["test image"], "test.png", { type: "image/png" });
    
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("이미지가 성공적으로 업로드되었습니다!");
    });
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  test("correctly changes button visibility during upload process", async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ 
        verifications: [{ verificationImage: 'test.jpg' }] 
      })
    };
    fetchUtils.fetchWithToken.mockResolvedValueOnce(mockResponse);

    const { container } = render(<CertificateBtn />);
    const initialButton = screen.getByRole('button');
    expect(initialButton).toBeInTheDocument();
    
    const fileInput = container.querySelector('input[type="file"]');
    const file = new File(["test image"], "test.png", { type: "image/png" });
    
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });
});