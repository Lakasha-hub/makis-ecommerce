import { Product, IProduct } from '../models/Product';
import { Types } from 'mongoose';

export class ProductRepository {
  async findAll(filter: Record<string, any> = {}): Promise<IProduct[]> {
    return Product.find(filter);
  }

  async findById(id: string | Types.ObjectId): Promise<IProduct | null> {
    return Product.findById(id);
  }

  async findBySku(sku: string): Promise<IProduct | null> {
    return Product.findOne({ sku });
  }

  async create(productData: Partial<IProduct>): Promise<IProduct> {
    const newProduct = new Product(productData);
    return newProduct.save();
  }

  async update(id: string | Types.ObjectId, updateData: Partial<IProduct>): Promise<IProduct | null> {
    return Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  async softDelete(id: string | Types.ObjectId): Promise<IProduct | null> {
    return Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
  }

  async updateVariantStock(productId: string | Types.ObjectId, variantId: string | Types.ObjectId, stock: number): Promise<IProduct | null> {
    return Product.findOneAndUpdate(
      { _id: productId, 'variants._id': variantId },
      { $set: { 'variants.$.stock': stock } },
      { new: true, runValidators: true }
    );
  }
}
