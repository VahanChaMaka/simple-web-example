package ru.grishagin.springreact.db;

import com.mysql.jdbc.exceptions.MySQLIntegrityConstraintViolationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class EmployeeJDBCTemplate implements EmployeeDAO {

    private DataSource dataSource;

    private JdbcTemplate jdbcTemplateObject;

    @Autowired
    public void setDataSource(DataSource dataSource) {
        this.dataSource = dataSource;
        this.jdbcTemplateObject = new JdbcTemplate(dataSource);
    }

    public void create(Employee employee) {
        String SQL = "insert into Employee (firstName, lastName, description, timestamp) values (?, ?, ?, ?)";
        jdbcTemplateObject.update( SQL, employee.getFirstName(), employee.getLastName(), employee.getDescription(), System.currentTimeMillis());
        return;
    }

    public Employee getEmployee(Integer id) {
        String SQL = "select * from Employee where id = ?";
        Employee employee = jdbcTemplateObject.queryForObject(SQL,
                new Object[]{id}, new EmployeeMapper());

        return employee;
    }

    public List<Employee> listEmployees() {
        String SQL = "select * from Employee";
        List <Employee> employees = jdbcTemplateObject.query(SQL, new EmployeeMapper());
        return employees;
    }

    public List<Employee> listEmployees(int page, int size) {
        String SQL = "select * from Employee limit ? , ?";
        List <Employee> employees = jdbcTemplateObject.query(SQL, new EmployeeMapper(), page, size);
        return employees;
    }

    public void delete(Integer id) {
        String SQL = "delete from Employee where id = ?";
        jdbcTemplateObject.update(SQL, id);
        System.out.println("Deleted Record with ID = " + id );
        return;
    }

    public void update(Employee employee) throws MySQLIntegrityConstraintViolationException{
        if(getTimestamp(employee.getId()).equals(employee.getTimestamp())) {
            String SQL = "update Employee set firstName = ?, lastName = ?, description = ?, timestamp = ? where id = ?";
            jdbcTemplateObject.update(SQL, employee.getFirstName(), employee.getLastName(), employee.getDescription(), System.currentTimeMillis(), employee.getId());
            System.out.println("Updated Record with ID = " + employee.getId());
        } else {
            throw new MySQLIntegrityConstraintViolationException("Old timestamp!");
        }
    }

    public int getSize() {
        String SQL = "select count(id) from Employee";
        return jdbcTemplateObject.queryForObject(SQL, Integer.class);
    }

    public Map<String, String> getAttributes(){
        Map<String, String> toReturn = new HashMap<String, String>();
        String SQL = "select * from names order by name desc";
        for (Map<String, String> row: jdbcTemplateObject.query(SQL, new AttributesMapper())) {
            toReturn.putAll(row);
        }
        return toReturn;
    }

    private Long getTimestamp(Long id){
        String SQL = "select timestamp from employee where id=" + id;
        return jdbcTemplateObject.queryForObject(SQL, Long.class);
    }
}
