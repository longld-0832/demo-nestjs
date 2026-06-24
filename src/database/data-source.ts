import { config as loadEnv } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { buildTypeOrmOptions } from './typeorm.config';

loadEnv();

export default new DataSource(buildTypeOrmOptions() as DataSourceOptions);
