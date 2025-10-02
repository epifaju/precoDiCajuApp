import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileText, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { PDFExportService, PDFExportData } from '../../services/pdfExportService';
import { SimulationResult, SimulationInput } from '../../types/simulation';

interface PDFExportButtonProps {
  inputs: SimulationInput;
  results: SimulationResult;
  chartRef?: React.RefObject<HTMLDivElement>;
  className?: string;
}

export const PDFExportButton: React.FC<PDFExportButtonProps> = ({
  inputs,
  results,
  chartRef,
  className
}) => {
  const { t, i18n } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExportPDF = async () => {
    if (isExporting) return;

    setIsExporting(true);
    setExportError(null);

    try {
      const exportData: PDFExportData = {
        inputs,
        results,
        timestamp: new Date().toISOString(),
        language: i18n.language
      };

      await PDFExportService.exportSimulationToPDF(exportData, chartRef?.current || null);
      
      // Show success message briefly
      setTimeout(() => {
        setIsExporting(false);
      }, 1000);

    } catch (error) {
      console.error('PDF export error:', error);
      setExportError(error instanceof Error ? error.message : 'Export failed');
      setIsExporting(false);
    }
  };

  return (
    <div className={className}>
      <Button
        onClick={handleExportPDF}
        disabled={isExporting}
        variant="outline"
        className="flex items-center space-x-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{t('simulation.pdf.exporting', 'Exportando...')}</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>{t('simulation.pdf.export', 'Exportar PDF')}</span>
          </>
        )}
      </Button>

      {exportError && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">
            {t('simulation.pdf.error', 'Erro ao exportar PDF')}: {exportError}
          </p>
        </div>
      )}

      {/* Export info tooltip */}
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-1">
          <FileText className="w-3 h-3" />
          <span>{t('simulation.pdf.info', 'Inclui dados, resultados e gráfico')}</span>
        </div>
      </div>
    </div>
  );
};
