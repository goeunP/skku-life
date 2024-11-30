import React, { useState, useEffect } from "react";
import { Avatar } from "@mui/material";
import Header from "../components/common/Header";
import DefaultProfile from "../assets/profile_default.png";
import Nav from "../components/common/Nav";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Chart from "../components/main/Chart";
import { fetchWithToken } from "../utils/fetchWithToken";

export default function GroupMainPage() {
  const [imageSrc, setImageSrc] = useState(DefaultProfile);

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
  const [classInfo, setClassInfo] = useState([]);

  const [loading, setLoading] = useState(true);

  const classId = sessionStorage.getItem("currentGroup");
  const token = sessionStorage.getItem("token");

  const today = new Date(2024, 10, 29);
  const formatDate = (date) => date.toISOString().split("T")[0];
  const getDateRange = (days) => {
    const dates = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(formatDate(date));
    }
    return dates;
  };

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
      console.log("users", res.data.userClass[0].classMember);
    } catch (error) {
      console.error("Error fetching user info:", error);
    } finally {
      setLoading(false);
    }
  };

  const getClassInfo = async () => {
    try {
      const res = await fetchWithToken("/class/" + classId, {
        method: "GET",
      });
      const data = await res.json();
      setClassInfo(data[0]);

      // Prefetch rest of the data
      // Do not use await here to prevent blocking
      // fetchWithToken('/class/' + classId + '/statistics');
      const dates = getDateRange(5);
      dates.map((date) => fetchWithToken('/verification/' + classId + '/' + date));
      fetchWithToken('/penalty/' + classId + '/log');
    } catch (error) {
      console.error("Error fetching class info:", error);
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
      await getClassInfo();
    };
    fetchData();

    const fetchImage = async () => {
      if(classInfo.classImage) {
        try {
          const response = await fetch(classInfo.classImage, { mode: "cors" });
          if (response.ok) {
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            setImageSrc(imageUrl);
          } else {
            console.error("Failed to fetch image:", response);
          }
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }
    };

    fetchImage();
  }, [classInfo.classImage]);

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
                src={imageSrc}
                crossOrigin="anonymous"
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
                <h3 style={{ margin: "0" }}>{classInfo.className}</h3>
                <p style={{ margin: "0" }}>{classInfo.classDescription}</p>
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
                <Chart data={users?.userClass[0]?.className === "기상스터디" ? [] : statistics} />
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
                {classInfo.classMember?.map((user) => (
                  <div
                    key={user.userImage}
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
