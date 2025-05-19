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

  // ====== 장학공지사항 이메일 알림 기능 ===== 
  const goToEmailFormBtn = document.getElementById('goToEmailFormBtn');
  if (goToEmailFormBtn) {
    goToEmailFormBtn.addEventListener('click', function() {
      window.open('https://docs.google.com/forms/d/1qonmjle2jvN2b9iQNIUOK37UtSlJf6oihVGbU7xeFT0/viewform?edit_requested=true', '_blank');
    });
  }

  // ====== 다크 모드 기능 =====
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

  // ====== 학교지도 기능 =====  
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

  // 즐겨찾기 데이터 불러오기 및 이벤트 등록 
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


