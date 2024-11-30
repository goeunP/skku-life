// Router: 각 URL에 따른 page 컴포넌트 연결
import { createBrowserRouter } from "react-router-dom";
import CertificationPage from "../pages/CertificationPage";
import PersonalCertificationPage from "../pages/PersonalCertificationPage";
import GroupMainPage from "../pages/GroupMainPage";
import PenaltyPage from "../pages/PenaltyPage";
import GroupMemberPage from "../pages/GroupMemberPage";

const router = createBrowserRouter([
  {
    path: "/certificate",
    element: <CertificationPage />,
    index: true,
  },
  {
    path: "/certificate/:id",
    element: <PersonalCertificationPage />,
  },
  {
    path: "/penalty",
    element: <PenaltyPage />,
    index: true,
    // index: true,
  },
  {
    path: "/main",
    element: <GroupMainPage />,
    index: true,
    // index: true,
  },
  {
    path: "/member/:id",
    element: <GroupMemberPage />,
    // index: true,
  }
]);

export default router;
