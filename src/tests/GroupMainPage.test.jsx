import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import axios from 'axios'
import GroupMainPage from '@/pages/GroupMainPage'

// Mock the assets
vi.mock('../assets/profile_default.png', () => ({
  default: 'default-profile-path'
}))

// Mock axios
vi.mock('axios')

// Mock navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}))

// Mock components
vi.mock('../components/common/Header', () => ({
  default: () => <div>Header</div>
}))

vi.mock('../components/common/Nav', () => ({
  default: () => <nav>Navigation</nav>
}))

vi.mock('../components/main/Chart', () => ({
  default: ({ data }) => <div data-testid="chart">Chart Component</div>
}))

// Mock Material-UI components
vi.mock('@mui/material', () => ({
  Avatar: ({ src, style, children }) => (
    <div data-testid="avatar" style={style}>
      <img src={src} alt="avatar" />
      {children}
    </div>
  )
}))

// Mock fetchWithToken
vi.mock('../utils/fetchWithToken', () => ({
  fetchWithToken: vi.fn().mockImplementation(() => 
    Promise.resolve({
      json: () => Promise.resolve([{
        className: '테스트 모임',
        classDescription: '테스트 모임 설명',
        classMember: [
          { userName: '테스트 유저', userImage: 'user-image.jpg' },
          { userName: '테스트 유저2', userImage: 'user-image2.jpg' }
        ]
      }])
    })
  )
}))

describe('GroupMainPage', () => {
  beforeEach(() => {
    // Mock sessionStorage
    const mockSessionStorage = {
      getItem: vi.fn((key) => {
        if (key === 'currentGroup') return '1'
        if (key === 'token') return 'test-token'
        return null
      })
    }
    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage
    })

    // Mock axios responses
    vi.mocked(axios.get).mockImplementation((url) => {
      if (url.includes('/user/info')) {
        return Promise.resolve({
          data: {
            userClass: [{
              classImage: 'test-image.jpg',
              className: '테스트 모임',
              classDescription: '테스트 모임 설명',
              classMember: [
                { userName: '테스트 유저', userImage: 'user-image.jpg' },
                { userName: '테스트 유저2', userImage: 'user-image2.jpg' }
              ]
            }]
          }
        })
      }
      if (url.includes('/statistics')) {
        return Promise.resolve({
          data: {
            chart: [
              { date: '2024-01', certificationRate: 80 },
              { date: '2024-02', certificationRate: 85 }
            ]
          }
        })
      }
      return Promise.reject(new Error('Not found'))
    })
  })

  it('shows loading state initially', () => {
    render(<GroupMainPage />)
    expect(screen.getByText('로딩 중...')).toBeInTheDocument()
  })

  it('renders header and navigation', async () => {
    await act(async () => {
      render(<GroupMainPage />)
    })
    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByText('Navigation')).toBeInTheDocument()
  })

  it('fetches and displays group information', async () => {
    await act(async () => {
      render(<GroupMainPage />)
    })

    await waitFor(() => {
      expect(screen.getByText('테스트 모임')).toBeInTheDocument()
      expect(screen.getByText('테스트 모임 설명')).toBeInTheDocument()
    })

    expect(axios.get).toHaveBeenCalledWith(
      'https://nsptbxlxoj.execute-api.ap-northeast-2.amazonaws.com/dev/user/info',
      expect.any(Object)
    )
  })

  it('displays group members', async () => {
    await act(async () => {
      render(<GroupMainPage />)
    })

    await waitFor(() => {
      expect(screen.getByText('모임원')).toBeInTheDocument()
      expect(screen.getByText('테스트 유저')).toBeInTheDocument()
      expect(screen.getByText('테스트 유저2')).toBeInTheDocument()
    })
  })

  it('navigates to member page when clicking on a member', async () => {
    await act(async () => {
      render(<GroupMainPage />)
    })

    await waitFor(() => {
      expect(screen.getByText('테스트 유저')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('테스트 유저'))

    expect(mockNavigate).toHaveBeenCalledWith(
      '/member/테스트 유저',
      expect.any(Object)
    )
  })

  it('displays statistics chart', async () => {
    await act(async () => {
      render(<GroupMainPage />)
    })

    await waitFor(() => {
      expect(screen.getByText('통계치')).toBeInTheDocument()
      expect(screen.getByTestId('chart')).toBeInTheDocument()
    })
  })
})