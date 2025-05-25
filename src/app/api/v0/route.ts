export async function POST(req: Request) {
  const numOfRows = 20;
  const pageNo = 1;
  const startDt = "20250301";
  const endDt = "20250520";
  const url = `https://apis.data.go.kr/1360000/AsosDalyInfoService/getWthrDataList?dataType=json&serviceKey=${process.env.WEATHER_API_KEY}&numOfRows=${numOfRows}&pageNo=${pageNo}&dataCd=ASOS&dateCd=DAY&startDt=${startDt}&endDt=${endDt}&stnIds=133`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(data, 19);

  const items = data.response?.body?.items?.item ?? [];
  const payload = { items };
  if (data.response.header.resultCode !== "00") {
    return Response.json(payload, {
      status: 500,
      statusText: "error",
    });
  }
  return Response.json(payload);
}
