function wrapText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  context.fillText(line, x, currentY);
  return currentY + lineHeight;
}

export async function compositeImage(
  backgroundUrl: string, 
  title: string, 
  subtitle: string, 
  bullets: string[], 
  layout: 'top' | 'center' | 'bottom'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject("No canvas context");

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Calculate cover crop dimensions
      const imgRatio = img.width / img.height;
      const canvasRatio = canvas.width / canvas.height;
      
      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      let offsetX = 0;
      let offsetY = 0;

      if (imgRatio > canvasRatio) {
        // Image is wider than canvas
        drawWidth = img.height * canvasRatio;
        offsetX = (img.width - drawWidth) / 2;
        ctx.drawImage(img, offsetX, 0, drawWidth, img.height, 0, 0, canvas.width, canvas.height);
      } else {
        // Image is taller than canvas
        drawHeight = img.width / canvasRatio;
        offsetY = (img.height - drawHeight) / 2;
        ctx.drawImage(img, 0, offsetY, img.width, drawHeight, 0, 0, canvas.width, canvas.height);
      }

      // Draw dark gradient overlay for text readability
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      if (layout === 'top') {
        gradient.addColorStop(0, 'rgba(0,0,0,0.8)');
        gradient.addColorStop(0.4, 'rgba(0,0,0,0.4)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.1)');
      } else if (layout === 'bottom') {
        gradient.addColorStop(0, 'rgba(0,0,0,0.1)');
        gradient.addColorStop(0.6, 'rgba(0,0,0,0.4)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.9)');
      } else {
        gradient.addColorStop(0, 'rgba(0,0,0,0.6)');
        gradient.addColorStop(0.5, 'rgba(0,0,0,0.8)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.6)');
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set up text styles
      ctx.textAlign = 'center';
      ctx.direction = 'rtl';
      
      let startY = 300;
      if (layout === 'center') startY = 700;
      if (layout === 'bottom') startY = 1200;

      // Draw Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 90px "Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      let currentY = wrapText(ctx, title, canvas.width / 2, startY, 900, 120);

      // Draw Subtitle
      if (subtitle) {
        currentY += 40;
        ctx.fillStyle = '#fbd38d'; // Light orange/yellow for subtitle
        ctx.font = 'bold 60px "Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
        currentY = wrapText(ctx, subtitle, canvas.width / 2, currentY, 900, 80);
      }

      // Draw Bullets
      if (bullets && bullets.length > 0) {
        currentY += 60;
        ctx.font = '50px "Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
        ctx.fillStyle = '#ffffff';
        bullets.forEach(bullet => {
          currentY = wrapText(ctx, "• " + bullet, canvas.width / 2, currentY, 850, 70);
          currentY += 20;
        });
      }

      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = reject;
    img.src = backgroundUrl;
  });
}
