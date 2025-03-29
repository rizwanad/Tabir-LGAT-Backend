import mongoose from "mongoose";


const purchaseCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  isUsed: { type: Boolean, default: false },
},{ timestamps: true });

const PurchaseCode = mongoose.model("PurchaseCode", purchaseCodeSchema);

export default PurchaseCode;
