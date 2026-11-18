
const REQUESTS_COUNT = 10;
const TIMEOUT_MS = 30_000;

async function fetchFully(url) {
  const start = process.hrtime.bigint();
  const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
  }

  const seconds = Number(process.hrtime.bigint() - start) / 1e9;
  return { seconds, size };
}

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error("Использование: node index.js <URL>");
    process.exit(1);
  }

  let totalBytes = 0;
  let totalTime = 0;

  for (let i = 1; i <= REQUESTS_COUNT; i++) {
    try {
      const { seconds, size } = await fetchFully(url);
      totalBytes += size;
      totalTime += seconds;
      console.log(
        `Запрос ${i}/${REQUESTS_COUNT}: ${seconds.toFixed(3)} с, ${(size / 1e6).toFixed(2)} МБ`
      );
    } catch (err) {
      const reason = err.cause?.code ?? err.message;
      console.error(`Ошибка запроса ${i}: ${reason}`);
      process.exit(1);
    }
  }

  const avgTime = totalTime / REQUESTS_COUNT;
  const speedMbit = (totalBytes * 8) / totalTime / 1e6; 

  console.log("-".repeat(40));
  console.log(`Среднее время запроса:  ${avgTime.toFixed(3)} с`);
  console.log(`Всего скачано:          ${(totalBytes / 1e6).toFixed(2)} МБ`);
  console.log(`Скорость скачивания:    ${speedMbit.toFixed(2)} Мбит/с`);
}

main();