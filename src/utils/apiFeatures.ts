// src/utils/apiFeatures.ts
import { Query } from 'mongoose';

interface QueryString {
    page?: string;
    limit?: string;
    sort?: string;
    fields?: string;
    search?: string;
    [key: string]: any;
}

class APIFeatures<T> {
    query: Query<T[], T>;
    queryString: QueryString;

    constructor(query: Query<T[], T>, queryString: QueryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
        excludedFields.forEach((el) => delete queryObj[el]);

        // Advanced filtering (gte, gt, lte, lt)
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    search(fields: string[]) {
        if (this.queryString.search) {
            const searchRegex = new RegExp(this.queryString.search, 'i');
            const searchConditions = fields.map((field) => ({
                [field]: searchRegex,
            }));
            this.query = this.query.find({ $or: searchConditions });
        }
        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    paginate() {
        const page = parseInt(this.queryString.page || '1', 10);
        const limit = parseInt(this.queryString.limit || '12', 10);
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

export default APIFeatures;