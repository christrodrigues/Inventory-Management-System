package com.inventory.designpattern.facade;

import com.inventory.model.Invoice;
import com.inventory.repository.InvoiceRepository;

public class PDFGen extends Facade{

	@Override
	protected void udpTrigger(String msg) {
		// TODO Auto-generated method stub
		
	}

	@Override
	protected void pdfGen(int invoiceID, InvoiceRepository invoiceRepo) {
		Invoice insertedInvoice = invoiceRepo.getInvoicebyID(invoiceID);
		createPDF pdf = new createPDF();
		pdf.generatePDF(insertedInvoice);
	}

	public static void pdfGenerator(int invoiceID, InvoiceRepository invoiceRepo) {
		new PDFGen().pdfGen(invoiceID, invoiceRepo);
	}
}
