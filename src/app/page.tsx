"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import { twMerge } from "tailwind-merge";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface WeatherProps {
  tm: string; //! 아이디 활용 //시간(일시)
  stnNm: string; // 지역
  avgTa: string; // 평균기온
  minTa: string; // 최저기온
  maxTa: string; // 최고기온
  sumRn: string; // 강수량
}

const Home = () => {
  const [viewType, setViewType] = useState<"temperature" | "rainfall" | null>(
    null
  );

  const fetchWeather = useCallback(async (): Promise<WeatherProps[]> => {
    const res = await fetch("/api/v0", { method: "POST" });
    if (!res.ok) {
      throw new Error("데이터 요청 실패");
    }
    const data = await res.json();
    return data.items ?? [];
  }, []);

  const {
    data: items = [],
    isPending,
    error,
  } = useQuery<WeatherProps[]>({
    queryKey: ["weatherData"],
    queryFn: fetchWeather,
  });

  const chartData =
    viewType === "temperature"
      ? {
          //차트에 들어갈 데이터
          labels: items.map((item) => item.tm),
          datasets: [
            {
              label: "평균기온",
              data: items.map((item) => parseFloat(item.avgTa)),
              borderColor: "green",
              backgroundColor: "green",
            },
            {
              label: "최저기온",
              data: items.map((item) => parseFloat(item.minTa)),
              borderColor: "skyblue",
              backgroundColor: "skyblue",
            },
            {
              label: "최고기온",
              data: items.map((item) => parseFloat(item.maxTa)),
              borderColor: "orange",
              backgroundColor: "orange",
            },
          ],
        }
      : viewType === "rainfall"
      ? {
          labels: items.map((item) => item.tm),
          datasets: [
            {
              label: "강수량",
              data: items.map((item) => parseFloat(item.sumRn)),
              backgroundColor: "rgba(153, 102, 255, 0.5)",
              borderColor: "rgb(153, 102, 255)",
            },
          ],
        }
      : null;

  const chartOptions: ChartOptions<"bar"> = {
    //차트위에 옵션
    responsive: true, // 차트가 브라우저 창 크기에 맞춰 자동으로 크기 조절
    plugins: {
      legend: { position: "top" as const }, //legend는 차트에 나오는 설명 박스 //"as const"는 TypeScript 문법으로, "top"을 리터럴 타입으로 고정하려는 뜻이에요. 없애도 작동은 합니다.
      title: {
        display: true, //display: true → 제목 보이게 설정
        text:
          (viewType === "rainfall" && "날짜별 강수량") ||
          (viewType === "temperature" && "날짜별 기온") ||
          "", //text: "날짜별 기온" → 실제로 보일 텍스트
      },
    },
  };

  if (isPending) {
    return <div>로딩중 ...</div>;
  }

  if (error) {
    return alert(`데이터를 가져오는 데 실패하였습니다.${error.message}`);
  }

  return (
    <div className=" bg-white text-black min-h-screen">
      <div
        className="cursor-pointer hover:text-sky-700"
        onClick={() => setViewType(null)}
      >
        <h1 className="text-2xl font-bold text-center p-2.5">
          대전 기온과 강수량
        </h1>
      </div>
      <div className="flex">
        <aside className="border min-w-16 max-h-[400px] flex flex-col">
          <div
            className={twMerge(
              "border-y p-1 cursor-pointer hover:text-sky-500",
              viewType === "temperature" && "text-sky-600 bg-zinc-50"
            )}
            onClick={() => setViewType("temperature")}
          >
            기온
          </div>
          <div
            className={twMerge(
              "border-y p-1 cursor-pointer hover:text-sky-500",
              viewType === "rainfall" && "text-sky-600 bg-zinc-50"
            )}
            onClick={() => setViewType("rainfall")}
          >
            강수량
          </div>
        </aside>
        <div
          className={twMerge(" w-full min-h-[400px] ", !viewType && "border")}
        >
          <div className=" ">
            {!viewType && (
              <p className="text-gray-500">확인하고 싶은 차트를 선택하세요.</p>
            )}
            {chartData ? (
              <div className="w-full min-h-[400px] border p-2.5">
                <Bar options={chartOptions} data={chartData} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
