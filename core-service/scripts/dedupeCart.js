/**
 * One-time migration: merge duplicate (userId, productId) cart rows, then build
 * the unique index. Run this BEFORE deploying the unique-index change if your
 * collection already has duplicates -- otherwise the index build fails.
 *
 *   node scripts/dedupeCart.js          # dry run: only reports what it would do
 *   node scripts/dedupeCart.js --apply  # merge quantities, delete extras, sync indexes
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Cart = require('../src/modules/cart/cart.model');

const APPLY = process.argv.includes('--apply');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const groups = await Cart.aggregate([
    { $sort: { createdAt: 1, _id: 1 } },
    {
      $group: {
        _id: { userId: '$userId', productId: '$productId' },
        ids: { $push: '$_id' },
        total: { $sum: '$quantity' },
        count: { $sum: 1 }
      }
    },
    { $match: { count: { $gt: 1 } } }
  ]);

  console.log(`${groups.length} duplicated (userId, productId) group(s) found.`);

  for (const g of groups) {
    const [keep, ...extras] = g.ids; // keep the oldest row
    console.log(
      `user=${g._id.userId} product=${g._id.productId}: keep ${keep}, ` +
      `delete ${extras.length}, merged quantity=${g.total}`
    );
    if (APPLY) {
      await Cart.updateOne({ _id: keep }, { $set: { quantity: g.total } });
      await Cart.deleteMany({ _id: { $in: extras } });
    }
  }

  if (APPLY) {
    await Cart.syncIndexes();
    console.log('Done. Unique index is in place.');
  } else {
    console.log('Dry run only. Re-run with --apply to make changes.');
  }

  await mongoose.disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
