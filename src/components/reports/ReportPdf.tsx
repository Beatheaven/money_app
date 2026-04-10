"use client";

import { Document, Page, Text, View, StyleSheet, Font, pdf } from "@react-pdf/renderer";
import { formatCurrency, formatDate } from "@/lib/utils";

Font.register({
  family: "Open Sans",
  fonts: [
    { src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf" },
    { src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf", fontWeight: 600 },
    { src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-800.ttf", fontWeight: 800 },
  ],
});

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: "Open Sans", fontSize: 10, color: "#333" },
  header: { marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 800, color: "#111" },
  subtitle: { fontSize: 12, color: "#666", marginTop: 4 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24, paddingBottom: 12, borderBottom: "1px solid #eee" },
  summaryItem: { flex: 1 },
  summaryLabel: { fontSize: 10, color: "#888", marginBottom: 4 },
  summaryValue: { fontSize: 14, fontWeight: 800 },
  green: { color: "#10b981" },
  red: { color: "#f43f5e" },
  table: { display: "flex", width: "auto", borderStyle: "solid", borderWidth: 1, borderColor: "#eee", borderRightWidth: 0, borderBottomWidth: 0 },
  tableRow: { margin: "auto", flexDirection: "row" },
  tableColHeader: { width: "20%", borderStyle: "solid", borderBottomWidth: 1, borderRightWidth: 1, borderColor: "#eee", backgroundColor: "#fafafa", padding: 6 },
  tableColHeaderLg: { width: "30%", borderStyle: "solid", borderBottomWidth: 1, borderRightWidth: 1, borderColor: "#eee", backgroundColor: "#fafafa", padding: 6 },
  tableCol: { width: "20%", borderStyle: "solid", borderBottomWidth: 1, borderRightWidth: 1, borderColor: "#eee", padding: 6 },
  tableColLg: { width: "30%", borderStyle: "solid", borderBottomWidth: 1, borderRightWidth: 1, borderColor: "#eee", padding: 6 },
  tableCellHeader: { fontSize: 9, fontWeight: 600, color: "#555" },
  tableCell: { fontSize: 9, color: "#444" },
  tableCellRight: { fontSize: 9, color: "#444", textAlign: "right" },
  tableCellHeaderRight: { fontSize: 9, fontWeight: 600, color: "#555", textAlign: "right" },
  footer: { marginTop: 30, textAlign: "center", fontSize: 8, color: "#aaa" },
});

const ReportDocument = ({ data, dateRange }: { data: any; dateRange: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Laporan Keuangan</Text>
        <Text style={styles.subtitle}>
          Periode: {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Pemasukan</Text>
          <Text style={[styles.summaryValue, styles.green]}>{formatCurrency(data.income, "IDR")}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Pengeluaran</Text>
          <Text style={[styles.summaryValue, styles.red]}>{formatCurrency(data.expense, "IDR")}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Saldo Bersih</Text>
          <Text style={[styles.summaryValue, data.balance >= 0 ? styles.green : styles.red]}>
            {formatCurrency(data.balance, "IDR")}
          </Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Tanggal</Text></View>
          <View style={styles.tableColHeaderLg}><Text style={styles.tableCellHeader}>Keterangan</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Kategori</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Wallet</Text></View>
          <View style={styles.tableColHeader}><Text style={styles.tableCellHeaderRight}>Nominal</Text></View>
        </View>
        {data.txns.map((tx: any, i: number) => (
          <View style={styles.tableRow} key={i}>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{formatDate(tx.date, "dd/MM/yyyy")}</Text></View>
            <View style={styles.tableColLg}><Text style={styles.tableCell}>{tx.note ?? tx.category.name}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{tx.category.name}</Text></View>
            <View style={styles.tableCol}><Text style={styles.tableCell}>{tx.wallet.name}</Text></View>
            <View style={styles.tableCol}>
              <Text style={[styles.tableCellRight, tx.type === "INCOME" ? styles.green : styles.red]}>
                {tx.type === "INCOME" ? "+" : "-"}{formatCurrency(tx.amount, tx.wallet.currency)}
              </Text>
            </View>
          </View>
        ))}
      </View>
      
      <View style={styles.footer}>
        <Text>Di-generate oleh MoneyTrack pada {formatDate(new Date(), "dd MMM yyyy HH:mm")}</Text>
      </View>
    </Page>
  </Document>
);

export async function generatePdfBlob(data: any, dateRange: any) {
  const blob = await pdf(<ReportDocument data={data} dateRange={dateRange} />).toBlob();
  return blob;
}
