import { useImage } from "../hooks/useImage";


export function TestPage() {
    const { images, setImages } = useImage();

  return (
    <div>
      <h2>📦 WebP 이미지 압축기 (라이브러리 사용)</h2>
      <input></input>
      <input type="file" accept="image/*" onChange={setImages} />
    </div>
  );
}
