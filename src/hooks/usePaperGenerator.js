import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export function usePaperGenerator(syllabusId) {
  
  // 1. Fetch Coverage Matrix
  const coverageData = useQuery({
    queryKey: ['pyq-coverage', syllabusId],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/api/pyq/coverage/`, {
        params: { syllabus_id: syllabusId }
      });
      return response.data;
    },
    enabled: !!syllabusId,
  });

  // 2. Generate Paper Mutation
  const generatePaper = useMutation({
    mutationFn: async (config) => {
      // Pass the syllabus_id alongside config as required
      const body = { ...config, syllabus_id: syllabusId };
      const response = await axios.post(`${API_BASE_URL}/api/pyq/generate/`, body, {
        responseType: 'blob', // Critical for PDF downloads
      });
      return response.data;
    },
    onSuccess: (blob, variables) => {
      // Trigger browser download
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${variables.title?.replace(/\s+/g, '_') || 'Sample_Paper'}_${timestamp}.pdf`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onError: (error) => {
      console.error('Paper Generation Error:', error);
      // Let the component handle UI notifications (toasts, etc.)
    }
  });

  return {
    coverage: coverageData.data,
    isCoverageLoading: coverageData.isLoading,
    isCoverageError: coverageData.isError,
    coverageError: coverageData.error,
    refreshCoverage: coverageData.refetch,
    
    generatePaper: generatePaper.mutate,
    isGenerating: generatePaper.isPending,
    generationError: generatePaper.error,
    generationStatus: generatePaper.status
  };
}
