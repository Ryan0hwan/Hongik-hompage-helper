function doGet(e) {
  try {
    // e가 undefined인 경우 빈 객체로 초기화
    e = e || {};
    e.parameter = e.parameter || {};
    
    // URL 파라미터 확인
    const params = e.parameter;
    
    // 이메일 등록 요청인 경우
    if (params.action === 'registerEmail') {
      return registerEmail(params.email);
    }
    
    // 기본 동작: 장학 공지사항 확인
    return checkNewScholarshipNotices();
  } catch (error) {
    Logger.log('doGet 오류: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 이메일 등록 함수
function registerEmail(email) {
  try {
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: '올바른 이메일 주소를 입력해주세요.'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 기존 이메일 목록 가져오기
    let recipients = PropertiesService.getScriptProperties().getProperty('EMAIL_RECIPIENTS') || '';
    const emailList = recipients.split(',').filter(e => e.trim() !== '');
        // 이미 등록된 이메일인지 확인
    if (emailList.includes(email)) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: '이미 등록된 이메일 주소입니다.'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 이메일 추가
    emailList.push(email);
    PropertiesService.getScriptProperties().setProperty('EMAIL_RECIPIENTS', emailList.join(','));
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: '이메일이 성공적으로 등록되었습니다.'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: '이메일 등록 중 오류가 발생했습니다: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function checkNewScholarshipNotices() {
  try {
    Logger.log('장학 공지사항 확인 시작');
    const url = 'https://www.hongik.ac.kr/kr/newscenter/notice.do?mode=list&srSearchKey=article.title&srSearchVal=장학';
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    
    if (response.getResponseCode() !== 200) {
      Logger.log('서버 응답 오류: ' + response.getResponseCode());
      return;
    }
    
    const html = response.getContentText();
    
    // 실제 HTML 구조에 맞는 정규식 패턴
    const pattern = /<tr[^>]*>[\s\S]*?<td[^>]*class="b-num-box"[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td[^>]*class="b-td-left"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>[\s\S]*?<span[^>]*class="b-title"[^>]*>([^<]*장학[^<]*)<\/span>[\s\S]*?<\/a>[\s\S]*?<\/td>[\s\S]*?<\/tr>/g;
    
    const matches = html.match(pattern);
    
    if (!matches) {
      Logger.log('일치하는 장학 공지사항을 찾을 수 없습니다.');
      return;
    }
    
    const newNotices = [];
    const lastCheckedDate = new Date(PropertiesService.getScriptProperties().getProperty('LAST_CHECKED_DATE') || '2000-01-01');
    
    // 추출을 위한 상세 패턴
    const detailPattern = /<tr[^>]*>[\s\S]*?<td[^>]*class="b-num-box"[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td[^>]*class="b-td-left"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>[\s\S]*?<span[^>]*class="b-title"[^>]*>([^<]*장학[^<]*)<\/span>[\s\S]*?<\/a>[\s\S]*?<\/td>[\s\S]*?<\/tr>/;
    
    // 최대 처리 항목 수 제한
    const maxItems = 10;
    let itemCount = 0;
    
    for (const match of matches) {
      if (itemCount >= maxItems) break;
      
      const parts = detailPattern.exec(match);
      if (!parts) continue;
      
      const [_, numberText, link, title] = parts;
      
      // 날짜 정보가 별도로 표시되지 않을 경우 현재 날짜 사용
      const currentDate = new Date();
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // 공지번호 정보 추출
      const number = numberText.trim();
      
      newNotices.push({
        title: title.trim(),
        date: dateStr,
        author: '홍익대학교',
        link: 'https://www.hongik.ac.kr' + link,
        number: number
      });
      
      itemCount++;
    }
    
    if (newNotices.length > 0) {
      sendEmailNotification(newNotices);
      PropertiesService.getScriptProperties().setProperty('LAST_CHECKED_DATE', new Date().toISOString());
    }
    
    Logger.log('장학 공지사항 확인 완료');
    return ContentService.createTextOutput(JSON.stringify({
      newNotices: newNotices,
      lastChecked: lastCheckedDate.toISOString(),
      currentTime: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('오류 발생: ' + error.toString());
    Logger.log('스택 트레이스: ' + error.stack);
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function sendEmailNotification(notices) {
  const recipients = PropertiesService.getScriptProperties().getProperty('EMAIL_RECIPIENTS').split(',');
  const subject = '[홍익대학교] 새로운 장학 공지사항이 있습니다';
  
  let body = '<h2>새로운 장학 공지사항</h2>';
  body += '<ul>';
  notices.forEach(notice => {
    body += `<li>
      <strong>${notice.title}</strong><br>
      작성일: ${notice.date}<br>
      작성자: ${notice.author}<br>
      <a href="${notice.link}">자세히 보기</a>
    </li><br>`;
  });
  body += '</ul>';
  
  GmailApp.sendEmail(recipients.join(','), subject, '', {
    htmlBody: body
  });
}

// 트리거 설정을 위한 함수
function createTimeDrivenTrigger() {
  // 기존 트리거 삭제
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  
  // 월, 수, 금 오전 10시에 실행되는 트리거 생성
  ScriptApp.newTrigger('checkNewScholarshipNotices')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(10)
    .create();
  
  ScriptApp.newTrigger('checkNewScholarshipNotices')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.WEDNESDAY)
    .atHour(10)
    .create();
  
  ScriptApp.newTrigger('checkNewScholarshipNotices')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.FRIDAY)
    .atHour(10)
    .create();
}

function manualCheckAndLog() {
  // 공지사항 확인 시작
  try {
    Logger.log('테스트 시작: 장학 공지사항 확인');
    const url = 'https://www.hongik.ac.kr/kr/newscenter/notice.do?mode=list&srSearchKey=article.title&srSearchVal=장학';
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    
    if (response.getResponseCode() !== 200) {
      Logger.log('서버 응답 오류: ' + response.getResponseCode());
      return '서버 응답 오류가 발생했습니다. 로그를 확인하세요.';
    }
    
    const html = response.getContentText();
    Logger.log('HTML 데이터 가져오기 성공 (' + html.length + ' 바이트)');
    
    // HTML 구조 검사
    Logger.log('HTML 구조 확인:');
    const hasTable = html.includes('<table');
    Logger.log('테이블 태그 존재: ' + hasTable);
    
    const hasTr = html.includes('<tr');
    Logger.log('TR 태그 존재: ' + hasTr);
    
    const hasTd = html.includes('<td');
    Logger.log('TD 태그 존재: ' + hasTd);
    
    // 수정된 정규식으로 장학 관련 공지 찾기
    const scholarshipPattern = /<tr[^>]*>[\s\S]*?<td[^>]*class="b-num-box"[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td[^>]*class="b-td-left"[^>]*>[\s\S]*?<a[^>]*href="([^"]*)"[^>]*>[\s\S]*?<span[^>]*class="b-title"[^>]*>([^<]*장학[^<]*)<\/span>[\s\S]*?<\/a>[\s\S]*?<\/td>[\s\S]*?<\/tr>/g;
    
    const scholarshipMatches = html.match(scholarshipPattern);
    Logger.log('장학 공지 검색 결과: ' + (scholarshipMatches ? scholarshipMatches.length + '개 찾음' : '찾지 못함'));
    
    if (scholarshipMatches) {
      scholarshipMatches.forEach((match, index) => {
        if (index < 3) { // 처음 3개만 로그에 기록
          Logger.log('장학 공지 #' + (index + 1) + ': ' + match.substring(0, 150) + '...');
        }
      });
    }
    
    // 일반 장학 관련 텍스트 검색
    const scholarshipTextMatches = html.match(/장학/g);
    Logger.log('장학 텍스트 포함 수: ' + (scholarshipTextMatches ? scholarshipTextMatches.length : '0'));
    
    return '테스트가 완료되었습니다. 로그를 확인하세요.';
  } catch (error) {
    Logger.log('테스트 중 오류 발생: ' + error.toString());
    Logger.log('스택 트레이스: ' + error.stack);
    return '테스트 중 오류가 발생했습니다. 로그를 확인하세요.';
  }
} 