import { Lead, Cliente } from './types';

export const exportToCSV = (data: Lead[] | Cliente[], filename: string) => {
  if (data.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  // Obtener headers desde el primer objeto
  const headers = Object.keys(data[0]);
  
  // Crear filas CSV
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(item => 
      headers.map(header => {
        const value = item[header as keyof typeof item];
        // Escapar valores que contienen comas o comillas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ].join('\n');

  // Crear y descargar archivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (data: Lead[] | Cliente[], filename: string) => {
  if (data.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToExcel = (data: Lead[] | Cliente[], filename: string) => {
  if (data.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  // Crear HTML table para Excel
  const headers = Object.keys(data[0]);
  const tableHTML = `
    <table>
      <thead>
        <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${data.map(item => `
          <tr>
            ${headers.map(header => `<td>${item[header as keyof typeof item] ?? ''}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.xls`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
