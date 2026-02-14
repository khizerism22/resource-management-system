import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export function exportToExcel(data, reportType, filename) {
  const workbook = XLSX.utils.book_new()

  const worksheet = XLSX.utils.json_to_sheet(data)
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report Data')

  const metadata = [
    { Field: 'Report Type', Value: reportType },
    { Field: 'Generated On', Value: new Date().toLocaleString() },
    { Field: 'Total Records', Value: data.length }
  ]
  const metaSheet = XLSX.utils.json_to_sheet(metadata)
  XLSX.utils.book_append_sheet(workbook, metaSheet, 'Metadata')

  XLSX.writeFile(workbook, `${filename}.xlsx`)
}

export function exportToPDF(data, reportType, summary, filename) {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text(reportType, 14, 20)

  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30)
  doc.text(`Total Records: ${data.length}`, 14, 35)

  let startY = 45
  if (summary) {
    doc.setFontSize(12)
    doc.text('Summary:', 14, startY)
    startY += 7
    doc.setFontSize(10)
    Object.entries(summary).forEach(([key, value]) => {
      if (typeof value !== 'object') {
        doc.text(`${key}: ${value}`, 14, startY)
        startY += 5
      }
    })
    startY += 5
  }

  let headers = []
  let rows = []

  if (reportType.includes('Sprint Success')) {
    headers = [['Period', 'Total', 'Success', 'At Risk', 'Failure', 'Success Rate %']]
    rows = data.map((row) => [row.period, row.total, row.success, row.atRisk, row.failure, row.successRate])
  } else if (reportType.includes('Scrum Maturity')) {
    headers = [['Period', 'Planning', 'Backlog', 'Collab', 'Daily', 'Exec', 'Review', 'Retro', 'Overall']]
    rows = data.map((row) => [
      row.period,
      row.sprintPlanning,
      row.backlog,
      row.collaboration,
      row.dailyScrum,
      row.execution,
      row.review,
      row.retrospective,
      row.overallScore
    ])
  } else if (reportType.includes('Resource Utilization')) {
    headers = [['Resource', 'Role', 'Avg Util %', 'Allocations', 'Over-Allocated']]
    rows = data.map((row) => [
      row.resourceName,
      row.role,
      row.avgUtilization,
      row.allocationsCount,
      row.overAllocated ? 'Yes' : 'No'
    ])
  } else if (reportType.includes('Recurring Failure')) {
    headers = [['Failure Reason', 'Count', 'Percentage %', 'Affected Projects']]
    rows = data.map((row) => [row.reason, row.count, row.percentage, row.affectedProjects])
  }

  doc.autoTable({
    startY,
    head: headers,
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235] },
    margin: { top: 10 }
  })

  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, {
      align: 'center'
    })
  }

  doc.save(`${filename}.pdf`)
}

export function downloadCSVBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
