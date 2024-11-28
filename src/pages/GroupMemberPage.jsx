import React, { useEffect, useState } from "react";
import Header from "../components/common/Header";
import Nav from "../components/common/Nav";
import MainMemberCertificate from "../components/main/MainMemberCertificate";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { Avatar } from "@mui/material";

export default function GroupMemberPage() {
  const location = useLocation();
  const user = location.state.user;

  const today = new Date();

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const [verificationData, setVerificationData] = useState([]);
  const token = sessionStorage.getItem('token');

  const getUserVerification = async () => {
    const requests = [];
    const dateLabels = [];

    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - i);
      const formattedDate = formatDate(targetDate);
      const request = axios.get(
        `https://nsptbxlxoj.execute-api.ap-northeast-2.amazonaws.com/dev/verification/${user.userClass[0].classId}/${formattedDate}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );
      requests.push(request);
      dateLabels.push(formattedDate);
    }

    try {
      const responses = await Promise.all(requests);
      const validData = responses
        .map((res, index) => ({
          date: dateLabels[index],
          data: res.data,
        }))
        .filter(
          (entry) =>
            entry.data.verifications && entry.data.verifications.length > 0
        );

      setVerificationData(validData);
    } catch (error) {
      console.error("인증 기록 불러오기 에러:", error);
    }
  };

  useEffect(() => {
    getUserVerification();
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

        {verificationData.map((d) => {
          return (
            <MainMemberCertificate
              key={d.date}
              date={d.date}
              image={d.data.verifications[0].verificationImage}
              status="success"
            />
          );
        })}
      </div>
    </div>
  );
}
