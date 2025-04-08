package edu.neu.csye7374.designpattern.observer;

import com.inventory.model.Product;
import com.inventory.designpattern.observer.Notify;

public abstract class ObserverAPI {
	
	protected Notify notify;
	
	public abstract void update(Product product);
}
