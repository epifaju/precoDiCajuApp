import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SimulationResult, SimulationInput } from '../types/simulation';
import { formatCurrency, calculateProfitMargin } from '../utils/simulationUtils';

export interface PDFExportData {
  inputs: SimulationInput;
  results: SimulationResult;
  timestamp: string;
  language: string;
}

export class PDFExportService {
  /**
   * Export simulation results to PDF
   */
  static async exportSimulationToPDF(
    data: PDFExportData,
    elementRef: HTMLElement | null
  ): Promise<void> {
    try {
      // Create new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Add title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(this.getTitle(data.language), pageWidth / 2, 20, { align: 'center' });
      
      // Add subtitle with date
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(this.getSubtitle(data.language, data.timestamp), pageWidth / 2, 30, { align: 'center' });
      
      // Add simulation data section
      this.addSimulationData(pdf, data, pageWidth);
      
      // Add results section
      const resultsEndY = this.addResultsSection(pdf, data, pageWidth);
      
      // Add chart if element is provided
      if (elementRef) {
        await this.addChartToPDF(pdf, elementRef, pageWidth, pageHeight, data.language, resultsEndY);
      }
      
      // Add footer
      this.addFooter(pdf, pageWidth, pageHeight, data.language);
      
      // Save the PDF
      const fileName = this.generateFileName(data.timestamp, data.language);
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      throw new Error('Failed to export PDF');
    }
  }
  
  /**
   * Add simulation input data to PDF
   */
  private static addSimulationData(pdf: jsPDF, data: PDFExportData, pageWidth: number): void {
    const startY = 45;
    let currentY = startY;
    
    // Section title
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(this.getDataTitle(data.language), 20, currentY);
    currentY += 10;
    
    // Input data
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    const inputs = [
      { label: this.getQuantityLabel(data.language), value: `${data.inputs.quantity} kg` },
      { label: this.getPriceLabel(data.language), value: formatCurrency(data.inputs.pricePerKg) },
      { label: this.getTransportLabel(data.language), value: formatCurrency(data.inputs.transportCosts) },
      { label: this.getOtherCostsLabel(data.language), value: formatCurrency(data.inputs.otherCosts) },
    ];
    
    inputs.forEach((input, index) => {
      pdf.text(`${input.label}:`, 20, currentY);
      pdf.setFont('helvetica', 'bold');
      pdf.text(input.value, 80, currentY);
      pdf.setFont('helvetica', 'normal');
      currentY += 7;
    });
  }
  
  /**
   * Add results section to PDF
   */
  private static addResultsSection(pdf: jsPDF, data: PDFExportData, pageWidth: number): number {
    const startY = 120;
    let currentY = startY;
    
    // Section title
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(this.getResultsTitle(data.language), 20, currentY);
    currentY += 10;
    
    // Results data
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    
    const profitMargin = calculateProfitMargin(data.results.grossRevenue, data.results.netRevenue);
    
    const results = [
      { 
        label: this.getGrossRevenueLabel(data.language), 
        value: formatCurrency(data.results.grossRevenue),
        formula: this.getGrossRevenueFormula(data.language)
      },
      { 
        label: this.getTotalExpensesLabel(data.language), 
        value: formatCurrency(data.results.totalExpenses),
        formula: this.getTotalExpensesFormula(data.language)
      },
      { 
        label: this.getNetRevenueLabel(data.language), 
        value: formatCurrency(data.results.netRevenue),
        formula: this.getNetRevenueFormula(data.language),
        highlight: true
      },
      { 
        label: this.getProfitMarginLabel(data.language), 
        value: `${profitMargin.toFixed(1)}%`,
        formula: this.getProfitMarginFormula(data.language)
      },
    ];
    
    results.forEach((result) => {
      // Label and value
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${result.label}:`, 20, currentY);
      
      if (result.highlight) {
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(result.value.includes('-') ? 255 : 0, result.value.includes('-') ? 0 : 255, 0);
      } else {
        pdf.setFont('helvetica', 'bold');
      }
      
      pdf.text(result.value, 80, currentY);
      
      // Reset color
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      currentY += 6;
      
      // Formula
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`(${result.formula})`, 20, currentY);
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(11);
      currentY += 8;
    });
    
    return currentY; // Return the final Y position
  }
  
  /**
   * Add chart to PDF
   */
  private static async addChartToPDF(
    pdf: jsPDF, 
    elementRef: HTMLElement | null, 
    pageWidth: number, 
    pageHeight: number,
    language: string,
    startY: number
  ): Promise<void> {
    if (!elementRef) {
      console.warn('No chart element provided for PDF export');
      return;
    }

    try {
      // Wait a bit to ensure the chart is fully rendered
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(elementRef, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: elementRef.offsetWidth,
        height: elementRef.offsetHeight
      });
      
      if (canvas.width === 0 || canvas.height === 0) {
        console.warn('Chart canvas has zero dimensions');
        return;
      }
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Calculate the current Y position (where the last content ended)
      let currentY = startY + 30; // Start after the results section with proper margin
      
      // Check if we need a new page for the chart
      if (currentY + imgHeight + 50 > pageHeight - 20) {
        pdf.addPage();
        currentY = 20; // Start at top of new page
      }
      
      // Add chart title
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(this.getChartTitle(language), 20, currentY);
      currentY += 15; // Move down after title
      
      // Add image
      pdf.addImage(imgData, 'PNG', 20, currentY, imgWidth, imgHeight);
      
    } catch (error) {
      console.warn('Could not add chart to PDF:', error);
    }
  }
  
  /**
   * Add footer to PDF
   */
  private static addFooter(pdf: jsPDF, pageWidth: number, pageHeight: number, language: string): void {
    const footerY = pageHeight - 10;
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    
    const footerText = this.getFooterText(language);
    pdf.text(footerText, pageWidth / 2, footerY, { align: 'center' });
    
    // Reset color
    pdf.setTextColor(0, 0, 0);
  }
  
  /**
   * Generate filename for PDF
   */
  private static generateFileName(timestamp: string, language: string): string {
    const date = new Date(timestamp);
    const dateStr = date.toISOString().split('T')[0];
    const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');
    
    const prefix = language === 'pt' ? 'simulacao' : language === 'fr' ? 'simulation' : 'simulation';
    return `${prefix}_${dateStr}_${timeStr}.pdf`;
  }
  
  // Translation methods
  private static getTitle(language: string): string {
    const titles = {
      pt: 'Simulador de Receitas - Cajou',
      fr: 'Simulateur de Revenus - Cajou',
      en: 'Revenue Simulator - Cashew'
    };
    return titles[language as keyof typeof titles] || titles.en;
  }
  
  private static getSubtitle(language: string, timestamp: string): string {
    const date = new Date(timestamp).toLocaleDateString();
    const subtitles = {
      pt: `Simulação générée em ${date}`,
      fr: `Simulation générée le ${date}`,
      en: `Simulation generated on ${date}`
    };
    return subtitles[language as keyof typeof subtitles] || subtitles.en;
  }
  
  private static getDataTitle(language: string): string {
    const titles = {
      pt: 'Dados da Simulação',
      fr: 'Données de la Simulation',
      en: 'Simulation Data'
    };
    return titles[language as keyof typeof titles] || titles.en;
  }
  
  private static getResultsTitle(language: string): string {
    const titles = {
      pt: 'Resultados da Simulação',
      fr: 'Résultats de la Simulation',
      en: 'Simulation Results'
    };
    return titles[language as keyof typeof titles] || titles.en;
  }
  
  private static getQuantityLabel(language: string): string {
    const labels = {
      pt: 'Quantidade',
      fr: 'Quantité',
      en: 'Quantity'
    };
    return labels[language as keyof typeof labels] || labels.en;
  }
  
  private static getPriceLabel(language: string): string {
    const labels = {
      pt: 'Preço por kg',
      fr: 'Prix par kg',
      en: 'Price per kg'
    };
    return labels[language as keyof typeof labels] || labels.en;
  }
  
  private static getTransportLabel(language: string): string {
    const labels = {
      pt: 'Custos de Transporte',
      fr: 'Coûts de Transport',
      en: 'Transport Costs'
    };
    return labels[language as keyof typeof labels] || labels.en;
  }
  
  private static getOtherCostsLabel(language: string): string {
    const labels = {
      pt: 'Outros Custos',
      fr: 'Autres Coûts',
      en: 'Other Costs'
    };
    return labels[language as keyof typeof labels] || labels.en;
  }
  
  private static getGrossRevenueLabel(language: string): string {
    const labels = {
      pt: 'Receita Bruta',
      fr: 'Revenu Brut',
      en: 'Gross Revenue'
    };
    return labels[language as keyof typeof labels] || labels.en;
  }
  
  private static getTotalExpensesLabel(language: string): string {
    const labels = {
      pt: 'Despesas Totais',
      fr: 'Dépenses Totales',
      en: 'Total Expenses'
    };
    return labels[language as keyof typeof labels] || labels.en;
  }
  
  private static getNetRevenueLabel(language: string): string {
    const labels = {
      pt: 'Receita Líquida',
      fr: 'Revenu Net',
      en: 'Net Revenue'
    };
    return labels[language as keyof typeof labels] || labels.en;
  }
  
  private static getProfitMarginLabel(language: string): string {
    const labels = {
      pt: 'Margem de Lucro',
      fr: 'Marge de Profit',
      en: 'Profit Margin'
    };
    return labels[language as keyof typeof labels] || labels.en;
  }
  
  private static getGrossRevenueFormula(language: string): string {
    const formulas = {
      pt: 'Quantidade × Preço por kg',
      fr: 'Quantité × Prix par kg',
      en: 'Quantity × Price per kg'
    };
    return formulas[language as keyof typeof formulas] || formulas.en;
  }
  
  private static getTotalExpensesFormula(language: string): string {
    const formulas = {
      pt: 'Transporte + Outros custos',
      fr: 'Transport + Autres coûts',
      en: 'Transport + Other costs'
    };
    return formulas[language as keyof typeof formulas] || formulas.en;
  }
  
  private static getNetRevenueFormula(language: string): string {
    const formulas = {
      pt: 'Receita Bruta - Despesas Totais',
      fr: 'Revenu Brut - Dépenses Totales',
      en: 'Gross Revenue - Total Expenses'
    };
    return formulas[language as keyof typeof formulas] || formulas.en;
  }
  
  private static getProfitMarginFormula(language: string): string {
    const formulas = {
      pt: 'Receita Líquida / Receita Bruta × 100',
      fr: 'Revenu Net / Revenu Brut × 100',
      en: 'Net Revenue / Gross Revenue × 100'
    };
    return formulas[language as keyof typeof formulas] || formulas.en;
  }
  
  private static getChartTitle(language: string): string {
    const titles = {
      pt: 'Gráfico dos Resultados',
      fr: 'Graphique des Résultats',
      en: 'Results Chart'
    };
    return titles[language as keyof typeof titles] || titles.en;
  }
  
  private static getFooterText(language: string): string {
    const texts = {
      pt: 'Généré par Preço di Cajú - Plateforme collaborative pour les prix du cajou en Guinée-Bissau',
      fr: 'Généré par Preço di Cajú - Plateforme collaborative pour les prix du cajou en Guinée-Bissau',
      en: 'Generated by Preço di Cajú - Collaborative platform for cashew prices in Guinea-Bissau'
    };
    return texts[language as keyof typeof texts] || texts.en;
  }
}
