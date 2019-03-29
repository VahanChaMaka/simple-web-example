package ru.grishagin.springreact.db;

import com.mysql.jdbc.exceptions.MySQLIntegrityConstraintViolationException;

import javax.sql.DataSource;
import java.util.List;
import java.util.Map;

public interface EmployeeDAO {
    /**
     * This is the method to be used to initialize
     * database resources ie. connection.
     */
    public void setDataSource(DataSource ds);

    /**
     * This is the method to be used to create
     * a record in the employee table.
     */
    public void create(Employee employee);

    /**
     * This is the method to be used to list down
     * a record from the employee table corresponding
     * to a passed employee id.
     */
    public Employee getEmployee(Integer id);

    /**
     * This is the method to be used to list down
     * the records from the employee table with paging.
     */
    public List<Employee> listEmployees(int page, int size);

    /**
     * This is the method to be used to list down
     * all the records from the employee table.
     */
    public List<Employee> listEmployees();

    /**
     * This is the method to be used to delete
     * a record from the employee table corresponding
     * to a passed employee id.
     */
    public void delete(Integer id);

    /**
     * This is the method to be used to update
     * a record into the employee table.
     */
    public void update(Employee employee) throws MySQLIntegrityConstraintViolationException;

    /**
     *
     * Get full amount of records in the table
     */
    public int getSize();

    /**
     *
     * Get mapping of employee properties with view names
     */
    Map<String, String> getAttributes();
}
