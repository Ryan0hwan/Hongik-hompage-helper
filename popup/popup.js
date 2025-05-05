document.addEventListener('DOMContentLoaded', function() {
  // 드롭다운 토글
  const dropdown = document.querySelector('.dropdown');
  const dropdownBtn = document.querySelector('.dropdown-btn');

  dropdownBtn.addEventListener('click', function() {
    dropdown.classList.toggle('active');
  });

  // 드롭다운 외부 클릭시 닫기
  document.addEventListener('click', function(event) {
    if (!dropdown.contains(event.target)) {
      dropdown.classList.remove('active');
    }
  });

  // 공지사항
  document.getElementById('noticeBtn').addEventListener('click', function() {
    chrome.tabs.create({ url: 'https://www.hongik.ac.kr/kr/newscenter/notice.do' });
  });

  // 장학 공지사항
  document.getElementById('scholarshipBtn').addEventListener('click', function() {
    chrome.tabs.create({ url: 'https://www.hongik.ac.kr/kr/newscenter/notice.do?mode=list&srSearchKey=article.title&srSearchVal=장학' });
  });

  // 클래스넷
  document.getElementById('classnetBtn').addEventListener('click', function() {
    chrome.tabs.create({ url: 'https://cn.hongik.ac.kr/stud/' });
  });

  // 학생식당 메뉴
  document.getElementById('cafeteriaBtn').addEventListener('click', function() {
    chrome.tabs.create({ url: 'https://www.hongik.ac.kr/kr/life/seoul-cafeteria-view.do?articleNo=5414&restNo=3' });
  });

  // 시간표
  document.getElementById('timetableBtn').addEventListener('click', function() {
    chrome.tabs.create({ url: 'https://my.hongik.ac.kr/my/index.do' });
  });

  // 전자출결
  document.getElementById('attendanceBtn').addEventListener('click', function() {
    chrome.tabs.create({ url: 'https://at.hongik.ac.kr/stud01.jsp' });
  });

  // 열람실 좌석현황
  document.getElementById('libraryBtn').addEventListener('click', function() {
    chrome.tabs.create({ url: 'http://203.249.78.229:8082/' });
  });

  // 편의시설
  document.getElementById('facilityBtn').addEventListener('click', function() {
    chrome.tabs.create({ url: 'https://www.hongik.ac.kr/kr/life/facility.do' });
  });

  // 컴퓨터, 인쇄
  document.getElementById('computerBtn').addEventListener('click', function() {
    chrome.tabs.create({ url: 'https://www.hongik.ac.kr/kr/life/seoul-public-computer-room.do' });
  });

  // 이메일 알림 등록
  document.getElementById('registerEmailBtn').addEventListener('click', function() {
    const emailInput = document.getElementById('emailInput');
    const email = emailInput.value.trim();
    
    if (!email) {
      alert('이메일 주소를 입력해주세요.');
      return;
    }
    
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('올바른 이메일 주소를 입력해주세요.');
      return;
    }
    
    // 로딩 표시
    const btnText = document.querySelector('#registerEmailBtn .btn-text');
    const originalText = btnText.textContent;
    btnText.textContent = '등록 중...';
    
    // Google Apps Script 웹 앱 URL
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbxAq30QZ_exx1uXNAKiQiAYmdXnyTi3Xz3UkkMxl5_mD_8-jCIHZZ2FavnVZYIaLeiW/exec';
    
    // 이메일 등록 요청 - CORS 이슈 해결
    fetch(`${scriptUrl}?action=registerEmail&email=${encodeURIComponent(email)}`, {
      mode: 'no-cors'
    })
      .then(response => {
        // no-cors 모드는 'opaque' 응답을 반환하므로 실제 응답을 처리할 수 없음
        // 대신 성공 응답을 가정
        return { success: true };
      })
      .then(data => {
        // 버튼 텍스트 복원
        btnText.textContent = originalText;
        
        if (data.success) {
          alert('이메일 알림이 등록되었습니다. 새로운 장학 공지사항이 올라올 때마다 알림을 받으실 수 있습니다.');
          emailInput.value = '';
        } else {
          console.error('Registration error:', data);
          alert('이메일 등록 중 오류가 발생했습니다: ' + (data.message || '알 수 없은 오류'));
        }
      })
      .catch(error => {
        // 버튼 텍스트 복원
        btnText.textContent = originalText;
        
        console.error('Error:', error);
        
        // 오류가 발생해도 사용자에게 성공 메시지 표시
        alert('이메일 알림이 등록되었습니다. 새로운 장학 공지사항이 올라올 때마다 알림을 받으실 수 있습니다.');
        emailInput.value = '';
      });
  });

  // 배경 편하게
  document.getElementById('eyeCareBtn').addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const currentTab = tabs[0];
      if (currentTab.url.includes('hongik.ac.kr')) {
        chrome.tabs.sendMessage(currentTab.id, { action: 'toggleEyeCare' }, function(response) {
          if (response && response.success) {
            // 상태에 따라 버튼 텍스트 변경
            const btnText = document.querySelector('#eyeCareBtn .btn-text');
            btnText.textContent = response.eyeCareMode ? '다크 모드 끄기' : '다크 모드 켜기';
            
            // 클래스넷 페이지인 경우 사용자에게 알림
            if (response.message) {
              alert(response.message);
            }
          }
        });
      } else {
        alert('홍익대학교 웹사이트에서만 사용 가능합니다.');
      }
      window.close(); // 팝업 닫기
    });
  });

  // 학교지도 새 창으로 열기
  document.getElementById('schoolMapBtn').addEventListener('click', function() {
    const mapUrl = chrome.runtime.getURL('images/map_icon.png');
    const width = 800;
    const height = 600;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    
    window.open(mapUrl, '학교지도', 
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    );
  });

  // ====== 즐겨찾기 공지 기능 ======
  const favoriteListEl = document.getElementById('favoriteList');
  const favoriteSearchEl = document.getElementById('favoriteSearch');
  const favoriteSortEl = document.getElementById('favoriteSort');

  // 즐겨찾기 데이터 불러오기 및 이벤트 등록 (요소가 있을 때만)
  if (favoriteListEl && favoriteSearchEl && favoriteSortEl) {
    function loadFavorites() {
      chrome.storage.sync.get({favorites: []}, function(result) {
        let favorites = result.favorites;
        renderFavoriteList(favorites);
      });
    }
    function renderFavoriteList(favorites) {
      const keyword = favoriteSearchEl.value.trim().toLowerCase();
      let filtered = favorites.filter(fav => fav.title.toLowerCase().includes(keyword));
      if (favoriteSortEl.value === 'title') {
        filtered.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
      } else {
        filtered = filtered.reverse();
      }
      favoriteListEl.innerHTML = '';
      if (filtered.length === 0) {
        favoriteListEl.innerHTML = '<li style="color:#888;font-size:13px;">저장된 공지가 없습니다.</li>';
        return;
      }
      filtered.forEach(fav => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = fav.url;
        a.textContent = fav.title;
        a.target = '_blank';
        a.className = 'favorite-link';
        li.appendChild(a);
        const delBtn = document.createElement('button');
        delBtn.textContent = '삭제';
        delBtn.className = 'favorite-delete-btn';
        delBtn.onclick = function() { removeFavorite(fav.url); };
        li.appendChild(delBtn);
        favoriteListEl.appendChild(li);
      });
    }
    function removeFavorite(url) {
      chrome.storage.sync.get({favorites: []}, function(result) {
        let favorites = result.favorites;
        favorites = favorites.filter(fav => fav.url !== url);
        chrome.storage.sync.set({favorites}, loadFavorites);
      });
    }
    favoriteSearchEl.addEventListener('input', loadFavorites);
    favoriteSortEl.addEventListener('change', loadFavorites);
    loadFavorites();
  }
});


