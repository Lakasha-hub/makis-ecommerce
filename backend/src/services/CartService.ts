import { CartRepository } from '../repositories/CartRepository';
import { ProductRepository } from '../repositories/ProductRepository';
import { ICart, ICartItem } from '../models/Cart';
import { Types } from 'mongoose';

const cartRepository = new CartRepository();
const productRepository = new ProductRepository();

export class CartService {
  async addOrUpdateCartItem(
    cartId: string | undefined,
    userId: string | undefined,
    productId: string,
    variantId: string,
    quantity: number
  ): Promise<ICart> {
    if (quantity <= 0) {
      throw new Error('Quantity must be at least 1');
    }

    let product;
    if (Types.ObjectId.isValid(productId)) {
      product = await productRepository.findById(productId);
    } else {
      product = await productRepository.findBySku(productId); // retrocompatibilidad
    }

    if (!product || !product.isActive) {
      throw new Error('Product not found or inactive');
    }

    const variant = product.variants.find(
      (v) => (v._id && v._id.toString() === variantId) || v.sku === variantId
    );

    if (!variant) {
      throw new Error('Variant not found');
    }

    // Buscar o crear carrito
    let cart = null;

    if (userId && Types.ObjectId.isValid(userId)) {
      cart = await cartRepository.findByUserId(userId);
    }

    if (!cart && cartId && Types.ObjectId.isValid(cartId)) {
      cart = await cartRepository.findById(cartId);
    }

    if (!cart) {
      const newCartData: Partial<ICart> = { items: [], totalAmount: 0 };
      if (userId && Types.ObjectId.isValid(userId)) {
        newCartData.userId = userId;
      }
      cart = await cartRepository.create(newCartData);
    } else if (!cart.userId && userId && Types.ObjectId.isValid(userId)) {
      cart.userId = userId;
    }

    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === product._id!.toString() &&
        item.variantId.toString() === (variant._id ? variant._id.toString() : variant.sku)
    );

    let requestedQuantity = quantity;
    if (existingItemIndex > -1) {
      requestedQuantity = cart.items[existingItemIndex].quantity + quantity;
    }

    // Verificar stock
    if (variant.stock < requestedQuantity) {
      throw new Error('Not enough stock for this variant');
    }

    const priceToUse = variant.price !== undefined ? variant.price : product.price;

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity = requestedQuantity;
      cart.items[existingItemIndex].unitPrice = priceToUse;
    } else {
      cart.items.push({
        productId: product._id as Types.ObjectId,
        variantId: variant._id ? variant._id : variant.sku,
        title: product.title,
        specification: `${variant.specificationLabel}: ${variant.specificationValue}`,
        unitPrice: priceToUse,
        quantity: requestedQuantity,
      } as unknown as ICartItem);
    }

    cart.totalAmount = cart.items.reduce(
      (total: number, item: ICartItem) => total + item.quantity * item.unitPrice,
      0
    );

    return cartRepository.save(cart);
  }

  async getCart(id: string): Promise<ICart | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid Cart ID');
    }
    return cartRepository.findById(id);
  }

  async getCartByUserId(userId: string): Promise<ICart | null> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid User ID');
    }
    return cartRepository.findByUserId(userId);
  }

  async removeCartItem(id: string, variantId: string): Promise<ICart | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid Cart ID');
    }

    const cart = await cartRepository.findById(id);
    if (!cart) {
      throw new Error('Cart not found');
    }

    cart.items = cart.items.filter(
      (item) => item.variantId.toString() !== variantId && item.variantId !== variantId
    );
    cart.totalAmount = cart.items.reduce(
      (total: number, item: ICartItem) => total + item.quantity * item.unitPrice,
      0
    );

    return cartRepository.save(cart);
  }

  async updateItemQuantity(id: string, variantId: string, quantity: number): Promise<ICart | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid Cart ID');
    }

    if (quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    const cart = await cartRepository.findById(id);
    if (!cart) {
      throw new Error('Cart not found');
    }

    if (quantity === 0) {
      return this.removeCartItem(id, variantId);
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.variantId.toString() === variantId || item.variantId === variantId
    );

    if (itemIndex === -1) {
      throw new Error('Item not found in cart');
    }

    // Verificar si hay stock suficiente en el producto
    const product = await productRepository.findById(cart.items[itemIndex].productId.toString());
    if (!product) {
      throw new Error('Product not found');
    }

    const variant = product.variants.find(
      (v) => (v._id && v._id.toString() === variantId) || v.sku === variantId
    );

    if (!variant || variant.stock < quantity) {
      throw new Error('Not enough stock for this variant');
    }

    cart.items[itemIndex].quantity = quantity;

    cart.totalAmount = cart.items.reduce(
      (total: number, item: ICartItem) => total + item.quantity * item.unitPrice,
      0
    );

    return cartRepository.save(cart);
  }

  async emptyCart(id: string): Promise<ICart | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid Cart ID');
    }

    const cart = await cartRepository.findById(id);
    if (!cart) {
      throw new Error('Cart not found');
    }

    cart.items = [];
    cart.totalAmount = 0;

    return cartRepository.save(cart);
  }
}
