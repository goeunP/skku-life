import React, { useEffect, useState } from "react";
import Header from "../components/common/Header";
import CertificateBtn from "../components/certificate/CertificateBtn.jsx";
import CertificateMember from "../components/certificate/CertificateMember";
import Nav from "../components/common/Nav";
import axios from "axios";
export default function CertificationPage() {
  const token = sessionStorage.getItem("token");

  const [certification, setCertification] = useState([]);
  const [classInfo, setClassInfo] = useState("");
  const [userInfo, setUserInfo] = useState([]);
  const today = new Date(2024, 10, 29);
  today.setDate(today.getDate() + 2);
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
        <CertificateBtn
          classId={classInfo.classId}
          onUploadSuccess={handleUploadSuccess}
        />
        {certification.map(({ date, verifications }) => (
          <div key={date} style={{ width: "100%" }}>
            <div style={{ fontWeight: "bold", marginBottom: "10px" }}>
              {date}
            </div>
            {verifications.map((data, index) => (
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
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
