/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { fetchWithToken } from "../../utils/fetchWithToken";

export default function CertificateBtn({ onUploadSuccess }) {
  const [upload, setUpload] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const inputRef = useRef();

  const onUploadImage = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    const file = e.target.files[0];
    setImageFile(file);
    setUpload(true);
  };

  const handleUpload = () => {
    if (!inputRef.current) {
      return;
    }
    inputRef.current.click();
  };

  const handleDelete = () => {
    setImageFile(null);
    setUpload(false);
  };

  const handleSubmit = async () => {
    if (!imageFile) {
      alert("이미지를 업로드해주세요!");
      return;
    }

    const formData = new FormData();
    const classId = sessionStorage.getItem("currentGroup");
    if (!classId) {
      alert("모임 ID를 찾을 수 없습니다!");
      return;
    }

    formData.append("classId", classId); // classId 추가
    formData.append("verification", imageFile); // 이미지 추가

    try {
      const response = await fetchWithToken("/verification/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP 오류: ${response.status}`);
      }

      const data = await response.json();
      console.log("업로드 성공:", data);

      alert("이미지가 성공적으로 업로드되었습니다!");

      // 성공한 이미지 URL을 부모로 전달
      if (onUploadSuccess) {
        onUploadSuccess(data.verifications[0]?.verificationImage || null);
      }

      // 초기화
      handleDelete();
    } catch (error) {
      console.error("업로드 실패:", error.message);
      alert("이미지 업로드 중 문제가 발생했습니다.");
    }
  };

  useEffect(() => {
    if (imageFile !== null) {
      handleSubmit();
    }
  }, [imageFile]);

  return (
    <div style={{ width: "100%" }}>
      {upload === false ? (
        <div>
          <input
            type="file"
            style={{ display: "none" }}
            accept="image/*"
            ref={inputRef}
            onChange={onUploadImage}
          />
          <button
            style={{
              backgroundColor: "#F2F2F2",
              width: "100%",
              height: "120px",
              borderRadius: "20px",
              marginBottom: "20px",
            }}
            onClick={handleUpload}
          >
            <h1>+ 인증하기</h1>
          </button>
        </div>
      ) : null}
    </div>
  );
}
