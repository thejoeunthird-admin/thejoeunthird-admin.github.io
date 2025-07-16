import { useImage } from '../../hooks';
import { profile } from '@img'
import { FiPlusCircle } from "react-icons/fi";
import * as S from './index.styled'

export function ProfileImage({image}) {
    const {
        images,
        setImages,
        getImages,
    } = image;
    return (<>
        <S.ProfileImageBox>
            <img src={images.length === 0 ? profile : getImages(images[images.length - 1])} />
            <FiPlusCircle />
            <div onClick={(e) => {
                e.preventDefault();
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.multiple = true;
                input.style.display = 'none';
                input.onchange = (event) => {
                    setImages(event);
                    document.body.removeChild(input); // 생성한 input 제거
                };
                document.body.appendChild(input); // 반드시 DOM에 붙여야 함
                input.click();
            }}>
                <FiPlusCircle />
            </div>
        </S.ProfileImageBox>
    </>)
}

// <img src={images.length === 0 ? profile : getImages(images[images.length - 1])} />
