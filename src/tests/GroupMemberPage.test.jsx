import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { act } from 'react'  // react에서 직접 import
import axios from 'axios'
import { fetchWithToken } from '@/utils/fetchWithToken'
import GroupMemberPage from '@/pages/GroupMemberPage'



// Mock the dependencies
vi.mock('axios')
vi.mock('@/utils/fetchWithToken', () => ({
  fetchWithToken: vi.fn().mockResolvedValue({
    json: () => Promise.resolve([{
      classMember: [
        { userName: '테스트 유저' }
      ]
    }])
  })
}))

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useLocation: () => ({
    state: {
      user: {
        userName: '테스트 유저',
        userImage: 'test-image-url',
        userClass: [{ classId: 'test-class-id' }]
      }
    },
    pathname: '',
    search: '',
    hash: '',
    key: ''
  }),
  Link: ({ children, to }) => <a href={to}>{children}</a>
}))

// Mock Material-UI components
vi.mock('@mui/material', () => ({
  Avatar: ({ src, alt, style }) => (
    <div className="MuiAvatar-root MuiAvatar-circular">
      <img src={src} alt={alt} style={style} />
    </div>
  ),
  Box: ({ children }) => <div>{children}</div>,
  Tabs: ({ children }) => <div>{children}</div>,
  Tab: ({ label, component: Component, to, ...props }) => {
    if (Component) {
      return <Component to={to}>{label}</Component>
    }
    return <div>{label}</div>
  }
}))

// Mock your components
vi.mock('../components/common/Header', () => ({
  default: () => <div>Header</div>
}))

vi.mock('../components/common/Nav', () => ({
  default: () => (
    <nav>
      <a href="/main">메인</a>
      <a href="/certificate">인증</a>
      <a href="/penalty">벌칙</a>
      <a href="/group-info">모임관리</a>
    </nav>
  )
}))

vi.mock('../components/main/MainMemberCertificate', () => ({
  default: ({ date, image, status }) => (
    <div data-testid="certificate">
      <div>{date}</div>
      <img src={image} alt="certification" />
      <div>{status}</div>
    </div>
  )
}))

describe('GroupMemberPage', () => {
  const mockUser = {
    userName: '테스트 유저',
    userImage: 'test-image-url',
    userClass: [{ classId: 'test-class-id' }]
  }

  const mockVerificationResponse = {
    verifications: [
      {
        verificationImage: 'verification-image-url',
        userName: '테스트 유저'
      }
    ]
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock sessionStorage
    const mockSessionStorage = {
      currentGroup: 'test-class-id',
      token: 'test-token'
    };
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn(key => mockSessionStorage[key]),
        setItem: vi.fn()
      },
      writable: true
    });
  })

  it('renders user information correctly', async () => {
    await act(async () => {
      render(<GroupMemberPage />)
    })
    
    expect(screen.getByText('테스트 유저')).toBeInTheDocument()
    expect(screen.getByAltText('user')).toHaveAttribute('src', 'test-image-url')
  })

  it('renders navigation links', async () => {
    await act(async () => {
      render(<GroupMemberPage />)
    })
    
    expect(screen.getByText('메인')).toBeInTheDocument()
    expect(screen.getByText('인증')).toBeInTheDocument()
    expect(screen.getByText('벌칙')).toBeInTheDocument()
    expect(screen.getByText('모임관리')).toBeInTheDocument()
  })

  it('fetches and displays verification data', async () => {
    // getUserInfo 응답 설정
    vi.mocked(axios.get)
      .mockResolvedValueOnce({ 
        data: {
          userName: '테스트 유저',
          userImage: 'test-image-url'
        }
      }) // getUserInfo 응답
      .mockResolvedValue({ 
        data: mockVerificationResponse 
      }); // verification 응답들
  
    await act(async () => {
      render(<GroupMemberPage />)
    })
  
    await waitFor(() => {
      const certificates = screen.getAllByTestId('certificate')
      expect(certificates).toHaveLength(6)
    })
  
    // getUserInfo 호출 1번 + 날짜별 데이터 요청 6번으로 총 7번 호출됨
    expect(axios.get).toHaveBeenCalledTimes(7)
  })

  it('handles API error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(axios.get).mockRejectedValue(new Error('API Error'))

    await act(async () => {
      render(<GroupMemberPage />)
    })

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching certification data:',
        expect.any(Error)
      )
    })

    consoleSpy.mockRestore()
  })

  it('formats dates correctly', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: mockVerificationResponse })

    await act(async () => {
      render(<GroupMemberPage />)
    })

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('2024-11-'),
        expect.any(Object)
      )
    })
  })

  it('filters out empty verification data', async () => {
    const emptyResponse = { data: { verifications: [] } }
    vi.mocked(axios.get)
      .mockResolvedValueOnce({ data: mockVerificationResponse })
      .mockResolvedValueOnce(emptyResponse)
      .mockResolvedValue({ data: mockVerificationResponse })

    await act(async () => {
      render(<GroupMemberPage />)
    })

    await waitFor(() => {
      const certificates = screen.getAllByTestId('certificate')
      expect(certificates.length).toBeLessThan(6)
    })
  })
})