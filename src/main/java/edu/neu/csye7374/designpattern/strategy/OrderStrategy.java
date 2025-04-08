package edu.neu.csye7374.designpattern.strategy;

import java.util.List;

import com.inventory.InventoryCartAPI;
import com.inventory.designpattern.decorator.CustomDecorator;
import com.inventory.designpattern.decorator.Product;
import com.inventory.model.ProductPO;
import com.inventory.model.PurchaseOrder;
import com.inventory.repository.ProductPORepository;
import com.inventory.repository.ProductRepository;
import com.inventory.repository.OrderRepository;
import com.inventory.designpattern.state.StockAlert;
import com.inventory.designpattern.state.State;
import com.inventory.designpattern.state.StockUpdate;


public class OrderStrategy implements StrategyAPI{

	private OrderRepository orderRepo;
	private ProductPORepository productPORepo;
	private ProductRepository productRepo;
	private int id;
	private PurchaseOrder purchaseOrder;
	private PurchaseOrder insertedPO; 
	
	public OrderStrategy(OrderRepository orderRepo,
						 ProductPORepository productPORepo, ProductRepository productRepo, PurchaseOrder insertedPO , PurchaseOrder purchaseOrder) {
		
		this.orderRepo = orderRepo;
		this.productPORepo = productPORepo;
		this.productRepo = productRepo;
		this.purchaseOrder = purchaseOrder;
		this.insertedPO = insertedPO;
	}
	
	public OrderStrategy(OrderRepository orderRepo, PurchaseOrder purchaseOrder) {
		this.orderRepo = orderRepo;
		this.purchaseOrder = purchaseOrder;
	}


	public OrderStrategy(OrderRepository orderRepo, int id) {
		super();
		this.orderRepo = orderRepo;
		this.id = id;
	}

	@Override
	public void add() {
	
		InventoryCartAPI cart = new Product();
		System.out.println("Inserted "+insertedPO.getId());
		List<ProductPO> productPOs = insertedPO.getProducts();
		//purchaseOrderRepository.save(insertedPO);
		
		for(ProductPO proPO : productPOs) {
			State s = new State();
			productPORepo.save(proPO);
			//Product product = productRepo.getProductbyID(proPO.getProduct().getId());
			com.inventory.model.Product product = proPO.getProduct();
			
			cart = new CustomDecorator(cart, product, proPO);
			int difference = product.getQuantity() - proPO.getQuantity();
			
			if(difference <= 100) {
				
				StockAlert low = new StockAlert(product, productRepo);
				low.action(s, difference);
			}else {
				
				StockUpdate stock = new StockUpdate(product, productRepo);
				stock.action(s, difference);
			}

		}
		insertedPO.setTotalAmount(cart.getCost());
		orderRepo.update(insertedPO);
	}

	@Override
	public void update() {
		orderRepo.update(purchaseOrder);
	
	}

	@Override
	public void delete() {
		PurchaseOrder purchaseOrder = orderRepo.getPurchaseOrderbyID(id);
		orderRepo.delete(purchaseOrder);
		
	}

}