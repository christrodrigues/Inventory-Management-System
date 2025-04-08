package com.inventory.designpattern.facade;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import com.inventory.model.Invoice;
import com.inventory.model.ProductPO;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;

public class createPDF {
	
	private Invoice invoice;
	
	public void generatePDF(Invoice invoice) {
		this.invoice = invoice;
		Document document = new Document();
		try {
			String filename = "Invoice_" + invoice.getId() + "_" + invoice.getPurchaseOrder().getBuyer().getCompanyName() + ".pdf";
			PdfWriter.getInstance(document, new FileOutputStream(filename));
		} catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (DocumentException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

		document.open();
		Font font1 = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, BaseColor.BLACK);
		Font font2 = FontFactory.getFont(FontFactory.HELVETICA, 16, BaseColor.BLACK);
		Paragraph p1 = new Paragraph("!nventoria Invoice for your Purchase", font1);
		Paragraph p2 = new Paragraph("Payment Date: " + invoice.getPaymentDate(), font2);
		
		PdfPTable table = new PdfPTable(4);
		addTableHeader(table);
		addRows(table);
		try {
			document.add(p1);
			document.add(p2);
			document.add( Chunk.NEWLINE );
			document.add(table);
		} catch (DocumentException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		document.close();
	}
	
	private void addTableHeader(PdfPTable table) {
		Stream.of("Product", "Quantity", "Unit Price", "Total Price").forEach(columnTitle -> {
			PdfPCell header = new PdfPCell();
			header.setBackgroundColor(BaseColor.LIGHT_GRAY);
			header.setBorderWidth(2);
			header.setPhrase(new Phrase(columnTitle));
			table.addCell(header);
		});
	}

	private void addRows(PdfPTable table) {
		
		List<ProductPO> productPOs = invoice.getPurchaseOrder().getProducts();

		List<ProductPO> distinctProductList = productPOs.stream().distinct().collect(Collectors.toList());
		for(ProductPO productPO : distinctProductList) {
			table.addCell(productPO.getProduct().getProductName());
			table.addCell(String.valueOf(productPO.getQuantity()));
			table.addCell("$" + productPO.getProduct().getPrice());
			double result = productPO.getProduct().getPrice() * productPO.getQuantity();
			table.addCell("$" + result);
		}
		
		table.addCell("Total");
		table.addCell("---");
		table.addCell("---");
		table.addCell("$" + invoice.getPurchaseOrder().getTotalAmount());
	}
}
