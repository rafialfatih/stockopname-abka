// Performance monitoring utilities

export const measureSearch = (startTime) => {
  const duration = performance.now() - startTime
  return duration
}

export const measureImport = (startTime, count) => {
  const duration = performance.now() - startTime
  const rate = (count / duration * 1000).toFixed(0)
  return duration
}

export const checkPerformance = () => {
  const perfData = performance.getEntriesByType('navigation')[0]
  
  return {
    fcp: perfData?.responseEnd - perfData?.fetchStart || 'N/A',
    tti: performance.now(),
    domReady: perfData?.domContentLoadedEventEnd - perfData?.fetchStart || 'N/A',
  }
}
