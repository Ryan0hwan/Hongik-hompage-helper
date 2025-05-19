// 눈편한 모드 상태 저장
let eyeCareMode = false;
// 현재 페이지가 클래스넷인지 체크
const isClassnetPage = window.location.hostname.includes('cn.hongik.ac.kr');

// 스타일 시트 생성
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  /* 다크모드 기본 스타일 - 그레이와 블랙 사이 색상으로 변경 */
  body.eye-care:not(.classnet-page), 
  .eye-care:not(.classnet-page) .container, 
  .eye-care:not(.classnet-page) .content, 
  .eye-care:not(.classnet-page) #container, 
  .eye-care:not(.classnet-page) #content,
  .eye-care:not(.classnet-page) div, 
  .eye-care:not(.classnet-page) section,
  .eye-care:not(.classnet-page) article,
  .eye-care:not(.classnet-page) aside { 
    background-color: #2d2d2d !important; 
    color: #e8e8e8 !important;
  }
  
  /* 헤더, 네비게이션 등의 요소 */
  .eye-care:not(.classnet-page) header, 
  .eye-care:not(.classnet-page) .header, 
  .eye-care:not(.classnet-page) #header, 
  .eye-care:not(.classnet-page) nav, 
  .eye-care:not(.classnet-page) .nav, 
  .eye-care:not(.classnet-page) #nav, 
  .eye-care:not(.classnet-page) .gnb, 
  .eye-care:not(.classnet-page) .lnb,
  .eye-care:not(.classnet-page) footer,
  .eye-care:not(.classnet-page) .footer { 
    background-color: #383838 !important; 
    color: #e8e8e8 !important;
  }
  
  /* 링크 */
  .eye-care:not(.classnet-page) a { 
    color: #8cb4ff !important; 
  }
  
  .eye-care:not(.classnet-page) a:hover { 
    color: #a9c8ff !important; 
  }
  
  /* 버튼 */
  .eye-care:not(.classnet-page) .btn, 
  .eye-care:not(.classnet-page) button, 
  .eye-care:not(.classnet-page) input[type="button"], 
  .eye-care:not(.classnet-page) input[type="submit"] {
    background-color: #4a4a4a !important;
    border-color: #666 !important;
    color: #e8e8e8 !important;
  }
  
  .eye-care:not(.classnet-page) .btn:hover, 
  .eye-care:not(.classnet-page) button:hover, 
  .eye-care:not(.classnet-page) input[type="button"]:hover, 
  .eye-care:not(.classnet-page) input[type="submit"]:hover {
    background-color: #5a5a5a !important;
  }
  
  /* 테이블 */
  .eye-care:not(.classnet-page) table { 
    background-color: #383838 !important; 
    color: #e8e8e8 !important;
    border-color: #555 !important;
  }
  
  .eye-care:not(.classnet-page) th { 
    background-color: #4a4a4a !important; 
    color: #e8e8e8 !important;
  }
  
  .eye-care:not(.classnet-page) tr:nth-child(even) { 
    background-color: #404040 !important; 
  }
  
  .eye-care:not(.classnet-page) tr:nth-child(odd) { 
    background-color: #383838 !important; 
  }
  
  .eye-care:not(.classnet-page) td {
    border-color: #555 !important;
  }
  
  /* 입력 필드 */
  .eye-care:not(.classnet-page) input[type="text"],
  .eye-care:not(.classnet-page) input[type="email"],
  .eye-care:not(.classnet-page) input[type="password"],
  .eye-care:not(.classnet-page) input[type="search"],
  .eye-care:not(.classnet-page) textarea,
  .eye-care:not(.classnet-page) select {
    background-color: #383838 !important;
    color: #e8e8e8 !important;
    border-color: #555 !important;
  }
  
  /* 이미지, 아이콘 등의 밝기 조정 */
  .eye-care:not(.classnet-page) img:not([src*=".svg"]),
  .eye-care:not(.classnet-page) video {
    filter: brightness(0.85) !important;
  }
  
  /* 경계선 */
  .eye-care:not(.classnet-page) * {
    border-color: #555 !important;
  }
  
  /* 강제 스타일 적용 - 인라인 스타일 오버라이드 */
  .eye-care:not(.classnet-page) [style*="background"] {
    background-color: #2d2d2d !important;
  }
  
  .eye-care:not(.classnet-page) [style*="color"] {
    color: #e8e8e8 !important;
  }
  
  /* 특별히 홍익대 사이트에 적용되는 스타일 */
  .eye-care:not(.classnet-page) #header,
  .eye-care:not(.classnet-page) header,
  .eye-care:not(.classnet-page) .header,
  .eye-care:not(.classnet-page) .gnb-wrap,
  .eye-care:not(.classnet-page) [style*="#0013DE"] {
    background-color: #383838 !important;
  }
`;

document.head.appendChild(styleSheet);

// 로컬 스토리지에서 눈편한 모드 상태 불러오기
chrome.storage.local.get(['eyeCareMode'], function(result) {
  if (result.eyeCareMode) {
    eyeCareMode = true;
    document.body.classList.add('eye-care');
    
    // 클래스넷 페이지인 경우 다크모드 적용하지 않음
    if (isClassnetPage) {
      document.body.classList.add('classnet-page');
    }
  }
});

// 메시지 리스너 추가
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'toggleEyeCare') {
    eyeCareMode = !eyeCareMode;
    
    if (eyeCareMode) {
      document.body.classList.add('eye-care');
      // 클래스넷 페이지인 경우 다크모드 적용하지 않음
      if (isClassnetPage) {
        document.body.classList.add('classnet-page');
      }
    } else {
      document.body.classList.remove('eye-care');
      document.body.classList.remove('classnet-page');
    }
    
    chrome.storage.local.set({ eyeCareMode: eyeCareMode });
    
    // 클래스넷 페이지인 경우 다크모드가 적용되지 않는다는 메시지 전달
    if (isClassnetPage) {
      sendResponse({ 
        success: true, 
        eyeCareMode: eyeCareMode,
        message: '클래스넷 페이지는 다크 모드가 적용되지 않습니다.' 
      });
    } else {
      sendResponse({ success: true, eyeCareMode: eyeCareMode });
    }
  }
  return true;
});

document.addEventListener('DOMContentLoaded', function() {
  // ===== 장학공지사항 이메일 알림 기능 =====
  const goToEmailFormBtn = document.getElementById('goToEmailFormBtn');
  if (goToEmailFormBtn) {
    goToEmailFormBtn.addEventListener('click', function() {
      window.open('https://docs.google.com/forms/d/1qonmj...'); // 기존 코드 유지
    });
  }
}); 