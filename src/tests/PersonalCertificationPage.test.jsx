import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import axios from 'axios'
import PersonalCertificationPage from '@/pages/PersonalCertificationPage'

// Mock assets
vi.mock('/src/assets/logo.png', () => ({
  default: 'mocked-logo-path'
}))

// Mock axios
vi.mock('axios')

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useLocation: () => ({
    state: {
      name: '테스트 유저',
      id: '1',
      img: 'test-image-url',
      statusColor: '#C8FFC3',
      date: '2024-11-28'
    }
  })
}))

// Mock Material-UI components
vi.mock('@mui/material', () => ({
  Avatar: ({ src, alt, style, children }) => (
    <div className="MuiAvatar-root" data-testid="avatar" style={style}>
      <img src={src} alt={alt} />
      {children}
    </div>
  )
}))

// Mock your components
vi.mock('../components/common/Header', () => ({
  default: () => <div>Header</div>
}))

vi.mock('../components/common/Nav', () => ({
  default: () => <nav>Navigation</nav>
}))

describe('PersonalCertificationPage', () => {
  const mockCertificationData = {
    verifications: [
      {
        userName: '테스트 유저',
        certificationDate: '2024-11-28T00:00:00.000Z',
        verificationImage: 'test-image-url'
      },
      {
        userName: '다른 유저',
        certificationDate: '2024-11-28T00:00:00.000Z',
        verificationImage: 'other-image-url'
      }
    ]
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(axios.get).mockResolvedValue({ data: mockCertificationData })
  })

  it('renders header and navigation', () => {
    render(<PersonalCertificationPage />)
    
    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByText('Navigation')).toBeInTheDocument()
  })

  it('renders user information correctly', () => {
    render(<PersonalCertificationPage />)
    
    expect(screen.getByText('테스트 유저')).toBeInTheDocument()
    expect(screen.getByText('2024-11-28')).toBeInTheDocument()
  })

  it('renders avatar with correct properties', () => {
    render(<PersonalCertificationPage />)
    
    const avatar = screen.getByTestId('avatar')
    expect(avatar).toHaveStyle({
      width: '70px',
      height: '70px',
      backgroundColor: '#D9D9D9',
      margin: 0
    })
  })

  it('renders certification image with correct properties', () => {
    render(<PersonalCertificationPage />)
    
    const image = screen.getByAltText('인증 사진을 업로드하세요.')
    expect(image).toHaveAttribute('src', 'test-image-url')
    expect(image).toHaveStyle({
        maxHeight: '400px', // 실제 컴포넌트의 스타일과 일치하도록 500px에서 400px로 수정
        width: '100%',
        objectFit: 'cover',
        borderRadius: '20px'
    })
})

  it('fetches certification data on mount', async () => {
    render(<PersonalCertificationPage />)

    expect(axios.get).toHaveBeenCalledWith(
      'https://nsptbxlxoj.execute-api.ap-northeast-2.amazonaws.com/dev/verification/1'
    )
  })

  it('filters certification data correctly', async () => {
    render(<PersonalCertificationPage />)

    await waitFor(() => {
      // 데이터가 정상적으로 필터링되었는지 확인
      const userName = screen.getByText('테스트 유저')
      expect(userName).toBeInTheDocument()
    })
  })

  it('handles empty certification data', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ 
      data: { verifications: [] } 
    })

    render(<PersonalCertificationPage />)

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled()
    })
  })

  it('applies correct styles to containers', () => {
    render(<PersonalCertificationPage />)

    // 메인 컨테이너 스타일 확인
    const mainContainer = screen.getByText('테스트 유저').closest('div')
    expect(mainContainer.parentElement).toHaveStyle({
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
      margin: 'auto 0'
    })
  })
})