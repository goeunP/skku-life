import React, { useEffect } from "react";
import Header from "../components/common/Header";
import Nav from "../components/common/Nav";
import { Avatar } from "@mui/material";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import MainMemberCertificate from "../components/main/MainMemberCertificate";

export default function GroupMemberPage() {
  const location = useLocation();
  const user = location.state.user; // 현재 유저 정보
  const classId = sessionStorage.getItem("currentGroup");
  const token = sessionStorage.getItem("token");

  const [certification, setCertification] = useState([]); // 인증 데이터
  const [classInfo, setClassInfo] = useState(""); // 클래스 정보
  const [userInfo, setUserInfo] = useState([]); // 사용자 정보
  const today = new Date(2024, 10, 29); // 현재 날짜
  today.setDate(today.getDate() + 2);

  const formatDate = (date) => date.toISOString().split("T")[0]; // 날짜 포맷

  const getDateRange = (days) => {
    const dates = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(formatDate(date));
    }
    return dates;
  };

  const mergeVerificationData = (dates, classMembers, verifications) => {
    const verificationMap = verifications.reduce((acc, verification) => {
      const { userName, verificationDate } = verification;
      if (!acc[verificationDate]) acc[verificationDate] = {};
      acc[verificationDate][userName] = verification;
      return acc;
    }, {});

    return dates.map((date) => {
      const dateVerifications = classMembers
        .filter((member) => verificationMap[date]?.[member.userName]) // getCertification 데이터에 없는 멤버 제외
        .map((member) => {
          const verification = verificationMap[date]?.[member.userName];
          return {
            ...verification,
            status:
              verification.verificationImage &&
              verification.yesVote + verification.noVote > 0
                ? verification.noVote > verification.yesVote
                  ? "fail"
                  : "success"
                : "none",
          };
        });

      return { date, verifications: dateVerifications };
    });
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
      setClassInfo(res.data.userClass[0]);
      setUserInfo(res.data);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const getCertification = async () => {
    const dates = getDateRange(6);
    const requests = dates.map((date) =>
      axios.get(
        `https://nsptbxlxoj.execute-api.ap-northeast-2.amazonaws.com/dev/verification/${classId}/${date}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
    );

    try {
      const responses = await Promise.all(requests);
      const allVerifications = responses.flatMap((res, index) => {
        const date = dates[index];
        return (res.data.verifications || []).map((v) => ({
          ...v,
          verificationDate: date,
        }));
      });
      const mergedData = mergeVerificationData(
        dates,
        classInfo.classMember,
        allVerifications
      );
      setCertification(mergedData);
    } catch (error) {
      console.error("Error fetching certification data:", error);
    }
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  useEffect(() => {
    if (classInfo) {
      getCertification();
    }
  }, [classInfo]);

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
        <div style={{ display: "flex", margin: "0", width: "100%" }}>
          <Avatar
            src={user.userImage}
            alt="user"
            style={{
              width: "80px",
              height: "80px",
              marginRight: "20px",
              marginLeft: "0",
            }}
          ></Avatar>
          <div style={{ gap: "5px", margin: "auto 0" }}>
            <h3 style={{ margin: "0" }}>{user.userName}</h3>
          </div>
        </div>

        <div style={{ width: "100%" }}>
          <h3 style={{ marginBottom: "5px" }}>인증 현황</h3>
        </div>

        {/* 각 날짜별 user.userName과 일치하는 데이터만 렌더링 */}
        {certification.map((d) => {
          const userVerification = d.verifications.filter(
            (verification) => verification.userName === user.userName
          );

          return (
            userVerification.length > 0 && (
              <MainMemberCertificate
                key={d.date}
                date={d.date}
                image={userVerification[0].verificationImage}
                status={userVerification[0].status}
              />
            )
          );
        })}
      </div>
    </div>
  );
}
