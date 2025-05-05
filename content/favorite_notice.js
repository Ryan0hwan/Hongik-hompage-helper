// 홍익대 공지사항 상세페이지에서만 동작
(function() {
  // 공지 제목 셀렉터를 실제 구조에 맞게 수정
  const titleEl = document.querySelector('.b-title');
  if (!titleEl) return;
  let title = titleEl.innerText.trim();

  // 너무 길면 앞 40자 + ...로 표시
  if (title.length > 40) {
    title = title.slice(0, 40) + '...';
  }

  const url = window.location.href;

  // 이미 버튼이 있으면 중복 삽입 방지
  if (document.getElementById('favoriteNoticeBtn')) return;

  // 버튼 생성
  const btn = document.createElement('button');
  btn.id = 'favoriteNoticeBtn';
  btn.textContent = '⭐ 즐겨찾기 추가';
  btn.style.marginLeft = '10px';
  btn.style.padding = '4px 10px';
  btn.style.background = '#ffe066';
  btn.style.border = '1px solid #ffd43b';
  btn.style.borderRadius = '4px';
  btn.style.cursor = 'pointer';
  btn.style.fontSize = '13px';

  // 버튼 삽입(제목 옆)
  titleEl.appendChild(btn);

  btn.addEventListener('click', function() {
    // 크롬 확장 저장소에 추가
    chrome.storage.sync.get({favorites: []}, function(result) {
      let favorites = result.favorites;
      // 중복 체크
      if (favorites.some(fav => fav.url === url)) {
        alert('이미 즐겨찾기에 추가된 공지입니다.');
        return;
      }
      favorites.push({ title, url });
      chrome.storage.sync.set({favorites}, function() {
        alert('즐겨찾기에 추가되었습니다!');
      });
    });
  });
})(); 