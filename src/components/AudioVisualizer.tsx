import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isRecording: boolean;
  audioData?: number[];
}

export const AudioVisualizer = ({ isRecording, audioData }: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.fillStyle = 'hsl(220 25% 8%)';
      ctx.fillRect(0, 0, width, height);

      if (!isRecording) {
        // Idle state - pulsing circle
        const time = Date.now() / 1000;
        const pulse = Math.sin(time * 2) * 0.3 + 0.7;
        
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 30 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(190, 95%, 55%, ${pulse * 0.5})`;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 20 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = 'hsl(190 95% 55%)';
        ctx.fill();
      } else {
        // Recording state - waveform
        const bars = 40;
        const barWidth = width / bars;
        
        for (let i = 0; i < bars; i++) {
          const time = Date.now() / 1000;
          const amplitude = audioData?.[i % audioData.length] || Math.sin(time * 3 + i * 0.5) * 0.5 + 0.5;
          const barHeight = amplitude * height * 0.6;
          
          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, 'hsl(195 85% 45%)');
          gradient.addColorStop(1, 'hsl(190 95% 55%)');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(
            i * barWidth + barWidth * 0.2,
            height - barHeight,
            barWidth * 0.6,
            barHeight
          );
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording, audioData]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={200}
      className="w-full h-48 rounded-lg"
      style={{ boxShadow: 'var(--glow-cyan)' }}
    />
  );
};
