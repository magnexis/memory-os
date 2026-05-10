import { BarChart, LineChart, RadarChart } from "echarts/charts";
import { GridComponent, RadarComponent, TooltipComponent } from "echarts/components";
import { init, use as registerECharts } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { useEffect, useRef } from "react";
import type { EChartsOption } from "echarts";

registerECharts([BarChart, LineChart, RadarChart, GridComponent, RadarComponent, TooltipComponent, CanvasRenderer]);

type MemoryChartProps = {
  option: EChartsOption;
  className?: string;
};

export function MemoryChart({ option, className = "h-64" }: MemoryChartProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const chart = init(ref.current, "dark", { renderer: "canvas" });
    chart.setOption(option);
    const resize = () => chart.resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      chart.dispose();
    };
  }, [option]);

  return <div ref={ref} className={`min-w-0 rounded-md border border-cyan/10 bg-void/70 ${className}`} />;
}
