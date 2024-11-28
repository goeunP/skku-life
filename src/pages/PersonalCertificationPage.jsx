import React from "react";
// import profileImg from "/src/assets/logo.png";
import Header from "../components/common/Header";
import Nav from "../components/common/Nav";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Avatar } from "@mui/material";

export default function PersonalCertificationPage() {
  const location = useLocation();
  const { name, id, img, statusColor, date, profileImg } = location.state;

  const [certification, setCertification] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  useEffect(() => {
    getCertification();
  }, []);
  const getCertification = async () => {
    const res = await axios.get(
      `https://nsptbxlxoj.execute-api.ap-northeast-2.amazonaws.com/dev/verification/${1}`
    );
    const data = res.data.verifications;

    setCertification([...data]);
  };

  useEffect(() => {
    const data = certification.filter((item) => {
      return (
        item.userName === name && item.certificationDate.slice(0, 10) === date
      );
    });
    setProcessedData(data);
  }, [certification]);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",

        margin: "0",
        marginTop: "120px",
        //alignItems: "center",
        gap: "10px",
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
          margin: "0px 10px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            gap: "10px",
            margin: "0px",
          }}
        >
          <Avatar
            src={profileImg}
            alt="user"
            style={{
              width: "70px",
              height: "70px",
              backgroundColor: "#D9D9D9",
              margin: 0,
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
            <div style={{ fontWeight: "bold", margin: "0px" }}>{name}</div>
            <div>{date}</div>
          </div>
        </div>
        <div
          style={{
            width: "90%",
            height: "60vh",
            backgroundColor: `${statusColor}`,
            borderRadius: "20px",
            display: "flex",
            padding: "20px",
            overflow: "hidden",
          }}
        >
          <img
            src={img}
            alt="인증 사진을 업로드하세요."
            style={{
              maxHeight: "400px",
              width: "100%",
              objectFit: "cover",
              borderRadius: "20px",
            }}
          ></img>
        </div>
      </div>
    </div>
  );
}
