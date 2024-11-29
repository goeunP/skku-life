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
  useEffect(() => {
    if (imageFile !== null) {
      handleSubmit();
    }
  }, [imageFile]);
  const handleSubmit = async () => {
    if (!imageFile) {
      alert("이미지를 업로드해주세요!");
      return;
    }
    const formData = new FormData();
    const classId = sessionStorage.getItem("currentGroup");
    formData.append("classId", classId);
    //const file = inputRef.current.files[0];
    //formData.append("verification", file);
    formData.append("verification", imageFile);

    console.log("Submitting:", formData);

    //onUploadSuccess(imageFile.name || null);
    try {
      const response = await fetchWithToken('/verification/upload', {
        method: 'POST',
        body: formData
      });

      console.log("response:", response);
      const data = await response.json();
      console.log("data:", data);
      
      console.log("업로드 성공:", data);
      alert("이미지가 성공적으로 업로드되었습니다!");
      // 성공한 이미지 URL 등 필요한 정보를 부모로 전달
      if (onUploadSuccess) {
        onUploadSuccess(data.verifications[0].verificationImage|| null); // 업로드된 이미지 URL을 부모로 전달
      }
    } catch (error) {
      console.error("업로드 실패:", error.response?.data || error.message);
      alert("이미지 업로드 중 문제가 발생했습니다.");
    }
  };
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
              marginBottom: "20px"
            }}
            onClick={handleUpload}
          >
            <h1>+ 인증하기</h1>
          </button>
        </div>
      ) : (
        null
      )}
    </div>
  );
}
