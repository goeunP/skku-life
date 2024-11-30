import React, { useEffect, useState } from "react";
import Header from "../components/common/Header";
import CertificateBtn from "../components/certificate/CertificateBtn.jsx";
import CertificateMember from "../components/certificate/CertificateMember";
import Nav from "../components/common/Nav";
import axios from "axios";
import { fetchWithToken } from "../utils/fetchWithToken.js";

export default function CertificationPage() {
  const token = sessionStorage.getItem("token");

  const [certification, setCertification] = useState([]);
  const [classInfo, setClassInfo] = useState("");
  const [userInfo, setUserInfo] = useState([]);
  const [isUploaded, setIsUploaded] = useState(false); // 업로드 상태 추가
  //const today = new Date(2024, 10, 29);
  const today = new Date();
  //today.setDate(today.getDate() + 2);
  const formatDate = (date) => date.toISOString().split("T")[0];
  const todayDate = formatDate(today); // 오늘 날짜
  const [status, setStatus] = useState("none");
  const getDateRange = (days) => {
    const dates = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(formatDate(date));
    }
    return dates;
  };

  const formatDate2 = (date) => {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = days[date.getDay()];

    return `${year}년 ${month}월 ${day}일 ${dayOfWeek}요일`;
  };

  const mergeVerificationData = (dates, classMembers, verifications) => {
    const verificationMap = verifications.reduce((acc, verification) => {
      const { userName, verificationDate } = verification;
      if (!acc[verificationDate]) acc[verificationDate] = {};
      acc[verificationDate][userName] = verification;
      return acc;
    }, {});

    return dates.map((date) => {
      // 해당 날짜에 대해 검증 데이터를 필터링
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

  const handleUploadSuccess = (uploadedImage) => {
    const currentUserName = userInfo.userName;
    const updatedCertification = certification.map((day) => {
      if (day.date === todayDate) {
        const isUserExist = day.verifications.some(
          (v) => v.userName === currentUserName
        );
        if (!isUserExist) {
          day.verifications.push({
            createdAt: new Date().toISOString(),
            noVote: 0,
            updatedAt: new Date().toISOString(),
            userName: currentUserName,
            verificationDate: todayDate,
            verificationId: null,
            verificationImage: uploadedImage,
            verificationStatus: 0,
            yesVote: 0,
            userImage: userInfo.userImage,
          });
        }
      }
      return day;
    });
    setCertification(updatedCertification);

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const date = `${year}-${month}-${day}`;
    fetchWithToken(`/verification/${classInfo.classId}/${date}`, {
      method: "GET",
      headers: {
        "X-Use-Network": 'true'
      }
  })
    setIsUploaded(true); // 업로드 성공 시 버튼 숨기기
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

      //setClassInfo(res.data.userClass[0]);
      const userData  = res.data;
      setUserInfo(userData);
      const classId = sessionStorage.getItem("currentGroup");

      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const date = `${year}-${month}-${day}`;

      console.log('Verification check -- userdata:', {userData, date});

      const verificationResponse = await fetchWithToken(`/verification/${classId}/${date}`);
      const verificationData = await verificationResponse.json();
      console.log('Verification check -- verificationData:', verificationData);

      verificationData.verifications.forEach((v) => {
        if (userData.userName === v.userName) {
          console.log("Already uploaded");
          setIsUploaded(true);
        }
      });

    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const getClassInfo = async () => {
    try {
      let classId = sessionStorage.getItem("currentGroup");
      const res = await fetchWithToken("/class/" + classId);
      const data = await res.json();
      setClassInfo(data[0]);
    } catch (error) {
      console.error("Error fetching class info:", error);
    }
  };

  const getCertification = async () => {
    const dates = getDateRange(5);
    const requests = dates.map((date) =>
      axios.get(
        `https://nsptbxlxoj.execute-api.ap-northeast-2.amazonaws.com/dev/verification/${classInfo.classId}/${date}`,
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
    getClassInfo();
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
        margin: "0",
        marginTop: "120px",
        gap: "15px",
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
          marginLeft: "10px",
          marginRight: "10px",
        }}
      >
        {/* 업로드 성공 시 버튼 숨기기 */}
        {!isUploaded && (
          <CertificateBtn
            classId={classInfo.classId}
            onUploadSuccess={handleUploadSuccess}
          />
        )}
        {certification.map(({ date, verifications }) => (
          <div key={date} style={{ width: "100%" }}>
            <div style={{ fontWeight: "bold" }}>
              <div
                style={{
                  textAlign: "center",
                  position: "relative",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#E8E8E8",
                    padding: "5px 15px",
                    borderRadius: "15px",
                    display: "inline-block",
                    fontSize: "13px",
                    color: "#666",
                  }}
                >
                  <h3>{formatDate2(new Date(date))}</h3>
                </div>
              </div>
            </div>
            {verifications.map((data, index) =>
              index === 3 ? (
                <CertificateMember
                  key={index}
                  id={data.verificationId}
                  date={data.verificationDate}
                  userName={data.userName}
                  totalCnt={classInfo.classMember.length}
                  curCnt={data.yesVote + data.noVote}
                  status={"none"}
                  setStatus={setStatus}
                  profileImg={data.userImage}
                  img={data.verificationImage}
                  yesVote={data.yesVote}
                  noVote={data.noVote}
                />
              ) : null
            )}
            {verifications.map((data, index) =>
              index === 3 ? null : (
                <CertificateMember
                  key={index}
                  id={data.verificationId}
                  date={data.verificationDate}
                  userName={data.userName}
                  totalCnt={classInfo.classMember.length}
                  curCnt={data.yesVote + data.noVote}
                  status={"none"}
                  setStatus={setStatus}
                  profileImg={data.userImage}
                  img={data.verificationImage}
                  yesVote={data.yesVote}
                  noVote={data.noVote}
                />
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
