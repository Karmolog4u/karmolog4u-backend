export function contractTemplate(data: {
  date: Date;
  header: string;
  fullname: string;
  idCode: string;
  passport: string;
  phone: string;
  points: { name: string; description: string }[];
}) {
  return `
<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8" />
  <style>
  body {
    margin: 0;
    padding: 0;
    background: #0c0c0c;
    font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
    color: #e8e8e8;
  }

  .main_wrapper {
    width: 794px; /* A4 */
    margin: 0 auto;
    padding: 60px 60px 30px;
    background: #0c0c0c;
  }

  /* ===== TITLE ===== */
  .title_wrapper {
    text-align: center;
    margin-bottom: 32px;
  }

  .title {
    font-size: 22px;
    font-weight: 500;
    line-height: 1;
    text-transform: uppercase;
    text-align: center;
    color: #fdfdfd;
    margin: 0;
    margin-bottom: 16px;
  }

  .subtitle {
    font-size: 20px;
    text-transform: uppercase;
    font-weight: 400;
    line-height: 1.4285714286;
    color: #fdfdfd;
    text-align: center;
    text-wrap: auto;
  }

  /* ===== HEADER ===== */
  .wrapper {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .text {
    font-size: 14px;
    font-weight: 400;
    line-height: 1.4285714286;
    color: #fdfdfd;
    text-align: left;
    margin: 0;
  }

  .header-text {
    font-size: 14px;
    font-weight: 400;
    line-height: 1.4285714286;
    color: #fdfdfd;
    text-align: left;
    text-transform: uppercase;
    text-wrap: auto;
    white-space: pre-line;
    margin-bottom: 16px;
  }

  /* ===== SECTION ===== */
  .section-title {
    font-size: 16px;
    font-weight: 400;
    line-height: 1.4285714286;
    color: #fdfdfd;
    text-align: left;
    text-transform: uppercase;
    text-wrap: auto;
    white-space: pre-line;
  }

  .section-text {
    font-size: 14px;
    font-weight: 400;
    line-height: 1.4285714286;
    color: #fdfdfd;
    text-align: left;
    text-wrap: auto;
    white-space: pre-line;
}
  

  /* ===== LIST ===== */
  .list {
    display: flex;
    flex-direction: column;

    margin: 0;
    padding: 0;
    }

  .item {
    display: flex;
    flex-direction: column;

    padding:0;
    margin:0;
  }
  .user-data {
    font-size: 14px;
    font-weight: 400;
    line-height: 1.4285714286;
    color: #fdfdfd;
    text-align: left;
    margin-top: 24px;
  }
  .user-data-span {
    margin-left: 8px;
    font-weight: 600;
    border-bottom: 1px solid #fdfdfd;
    padding-bottom: 2px;
    display: inline-block;
  }

  /* ===== PAGE BREAK ===== */
  .page-break {
    page-break-after: always;
  }
</style>
</head>
<body>
  <div class="main_wrapper">
  <div class="title_wrapper">
    <h2 class="title">ДОГОВІР</h2>
    <p class="subtitle">про надання освітньо-навчальних послуг</p>
  </div>

  <div class="wrapper">
    <p class="text">м. Київ</p>
    <p class="text">${formatUADate(data.date)}</p>
  </div>

  <p class="header-text">${data.header}</p>

  <ul class="list">
  ${data.points
    .map(
      (p) => `
      <li class="item">  
        <h3 class="section-title">${p.name}</h3>
        <p class="section-text">${p.description.replace(/\n/g, '<br/>')}</p>
      </li>
      `,
    )
    .join('')}
    </ul>
    <div class="user-data">
    <p class="user-data">Повне ім'я:<span class="user-data-span">${
      data.fullname
    }</span> </p>
    <p class="user-data">Ідентифікаційний код: <span class="user-data-span">${
      data.idCode
    }</span></p>
    <p class="user-data">Паспортні дані: <span class="user-data-span">${
      data.passport
    }</span></p>
    <p class="user-data">Телефон: <span class="user-data-span">${
      data.phone
    }</span></p>
    </div
</div>

</body>
</html>
`;
}

export function formatUADate(dateInput: string | Date): string {
  const date = new Date(dateInput);

  return new Intl.DateTimeFormat('uk-UA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
