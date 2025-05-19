import "../css/layout.css"
import { useNavigate } from 'react-router-dom';

export function Layout({ children }) {
    const navigate = useNavigate();

    return(<>
        <div className="layout">
            <header>
                <div className="breakpoints">
                     <button 
                     onClick={() => navigate('/login')}
                    >     
                        로그인(임시)
                    </button>
                </div>
            </header>
            <main className="breakpoints main">
                { children }
            </main>
            <footer>
                <div className="breakpoints">
                    ( 푸터 내용을 적어주세요 )
                </div>
            </footer>
        </div>
    </>)
}

