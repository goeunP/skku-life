import React, { useState, useEffect } from "react";
import { Avatar } from "@mui/material";
import Header from "../components/common/Header";
import DefaultProfile from "../assets/profile_default.png";
import Nav from "../components/common/Nav";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Chart from "../components/main/Chart";

export default function GroupMainPage() {
  const [statistics, setStatistics] = useState([]);
  const navigate = useNavigate();
  const [users, setUsers] = useState({
    userClass: [
      {
        classImage: DefaultProfile,
        className: "기본 모임 이름",
        classDescription: "기본 모임 설명",
        classMember: [],
      },
    ],
  });

  const [loading, setLoading] = useState(true);

  const classId = sessionStorage.getItem("currentGroup");
  const token = sessionStorage.getItem("token");

  const getUserInfo = async () => {
    try {
      const res = await axios.get(
        "https://nsptbxlxoj.execute-api.ap-northeast-2.amazonaws.com/dev/user/info",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching user info:", error);
    } finally {
      setLoading(false);
    }
  };

  const getClassStatistics = async () => {
    try {
      const res = await axios.get(
        `https://nsptbxlxoj.execute-api.ap-northeast-2.amazonaws.com/dev/class/${classId}/statistics`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStatistics(res.data.chart);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await getUserInfo();
      await getClassStatistics();
    };
    fetchData();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        gap: "15px",
        margin: "0",
        marginTop: "120px",
      }}
    >
      <div style={{ margin: "0" }}>
        <Header />
        <Nav />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          margin: "0 10px",
        }}
      >
        {/* 로딩 상태 처리 */}
        {loading ? (
          <p>로딩 중...</p>
        ) : (
          <>
            {/* 모임 정보 */}
            <div style={{ display: "flex", margin: "0", width: "100%" }}>
              <Avatar
                src={users?.userClass[0]?.classImage || DefaultProfile}
                style={{
                  width: 80,
                  height: 80,
                  marginRight: "20px",
                  marginLeft: "0",
                }}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                  margin: "auto 0",
                }}
              >
                <h3 style={{ margin: "0" }}>
                  {users?.userClass[0]?.className}
                </h3>
                <p style={{ margin: "0" }}>
                  {users?.userClass[0]?.classDescription}
                </p>
              </div>
            </div>

            {/* 통계 부분 */}
            <div style={{ width: "100%" }}>
              <h3 style={{ marginBottom: "5px" }}>통계치</h3>
              <div
                style={{
                  backgroundColor: "white",
                  textAlign: "center",
                }}
              >
                <Chart data={
        users?.userClass[0]?.className === "기상스터디" ? [] : statistics
      } />
              </div>
            </div>

            {/* 모임원 리스트 */}
            <div style={{ width: "100%" }}>
              <h3 style={{ marginBottom: "5px" }}>모임원</h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(85px, 1fr))",
                  rowGap: "15px",
                  columnGap: "5px",
                }}
              >
                {users?.userClass[0]?.classMember?.map((user) => (
                  <div
                    key={user.email}
                    style={{ textAlign: "center", width: 85, height: 100 }}
                    onClick={() =>
                      navigate(`/member/${user.userName}`, {
                        state: { user },
                      })
                    }
                  >
                    <Avatar
                      src={user.userImage}
                      style={{ width: 70, height: 70 }}
                    />
                    <p>{user.userName}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
