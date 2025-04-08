package com.inventory.designpattern.facade;

import com.inventory.designpattern.factory.CommunicationInstanceFactory;
import com.inventory.repository.InvoiceRepository;

public class SendMessage extends Facade{

	@Override
	protected void udpTrigger(String msg) {
		// TODO Auto-generated method stub
		new CommunicationInstanceFactory().getObject().triggerServerClient(msg);
	}
	
	public static void message(String msg) {
		
		SendMessage send = new SendMessage();
		send.udpTrigger(msg);
	
	}

	@Override
	protected void pdfGen(int id, InvoiceRepository invoiceRepo) {
		// TODO Auto-generated method stub
		
	}

}
